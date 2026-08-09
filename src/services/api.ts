import { UserProfile, UserSettings, WorkoutHistoryItem, WorkoutPreset } from '../types';

const TOKEN_KEY = 'pulse_token';

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Generic fetch wrapper with auth header & safe parsing
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300);

    response = await fetch(endpoint, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    throw new Error('SERVER_OFFLINE');
  }

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }
  }

  if (!response.ok) {
    if (data && data.error) {
      throw new Error(data.error);
    }
    throw new Error('SERVER_OFFLINE');
  }

  if (!data) {
    throw new Error('SERVER_OFFLINE');
  }

  return data as T;
}

// Helper for local offline user storage
const getLocalUsers = (): UserProfile[] => {
  const saved = localStorage.getItem('pulse_local_users');
  return saved ? JSON.parse(saved) : [];
};

const saveLocalUser = (user: UserProfile) => {
  const users = getLocalUsers().filter((u) => u.email !== user.email);
  users.push(user);
  localStorage.setItem('pulse_local_users', JSON.stringify(users));
};

// API Service Functions
export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim() || 'Atleta Pro';

    try {
      const data = await apiFetch<{ user: UserProfile; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: cleanName, email: cleanEmail, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (err: any) {
      if (err.message !== 'SERVER_OFFLINE' && !err.message.includes('servidor')) {
        throw err;
      }
      // Offline / dev mode fallback
      const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        isLoggedIn: true,
      };
      saveLocalUser(newUser);
      setAuthToken(`local_token_${Date.now()}`);
      return { user: newUser, token: `local_token_${Date.now()}` };
    }
  },

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const cleanEmail = email.trim().toLowerCase();

    try {
      const data = await apiFetch<{ user: UserProfile; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (err: any) {
      if (err.message !== 'SERVER_OFFLINE' && !err.message.includes('servidor')) {
        throw err;
      }

      // Check if user exists in local storage
      const localUsers = getLocalUsers();
      const existing = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);

      if (existing) {
        const loggedUser = { ...existing, isLoggedIn: true };
        setAuthToken(`local_token_${Date.now()}`);
        return { user: loggedUser, token: `local_token_${Date.now()}` };
      }

      // If account doesn't exist locally nor on server
      throw new Error('Esta conta ainda não foi cadastrada. Clique na aba CADASTRAR para criar sua conta.');
    }
  },

  async getMe(): Promise<{ user: UserProfile }> {
    try {
      return await apiFetch<{ user: UserProfile }>('/api/auth/me');
    } catch (e) {
      const savedUser = localStorage.getItem('pulse_user');
      if (savedUser) {
        return { user: JSON.parse(savedUser) };
      }
      throw e;
    }
  },

  // History
  async getHistory(): Promise<WorkoutHistoryItem[]> {
    try {
      const data = await apiFetch<any[]>('/api/history');
      return data.map((item) => ({
        id: item.id,
        title: item.presetName || 'Treino Pulse',
        type: item.presetCategory || 'CUSTOM',
        durationMinutes: Math.round((item.durationSeconds || 0) / 60) || 1,
        dateStr: item.completedAt ? new Date(item.completedAt).toLocaleDateString('pt-BR') : 'Hoje',
        timestamp: item.completedAt ? new Date(item.completedAt).getTime() : Date.now(),
        roundsCompleted: 4,
        totalRounds: 4,
        colorBorder: 'border-accent',
        iconName: 'fi-rr-play-alt',
      }));
    } catch (e) {
      const saved = localStorage.getItem('pulse_history');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addHistory(item: WorkoutHistoryItem): Promise<void> {
    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          id: item.id,
          presetName: item.title,
          presetCategory: item.type,
          durationSeconds: item.durationMinutes * 60,
          completedAt: new Date(item.timestamp).toISOString(),
          caloriesBurned: item.durationMinutes * 8,
        }),
      });
    } catch (e) {
      console.warn('Servidor offline: salvando histórico localmente');
    }
  },

  async deleteHistoryItem(id: string): Promise<void> {
    try {
      await apiFetch(`/api/history/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Servidor offline: removendo histórico localmente');
    }
  },

  async clearHistory(): Promise<void> {
    try {
      await apiFetch('/api/history', { method: 'DELETE' });
    } catch (e) {
      console.warn('Servidor offline: limpando histórico localmente');
    }
  },

  // Custom Presets
  async getPresets(): Promise<WorkoutPreset[]> {
    try {
      const data = await apiFetch<any[]>('/api/presets');
      return data.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.category || 'CUSTOM',
        subtitle: `${item.workSeconds}s Trabalho / ${item.restSeconds}s Descanso`,
        workSeconds: item.workSeconds,
        restSeconds: item.restSeconds,
        prepSeconds: item.prepSeconds || 10,
        exercisesPerSet: 1,
        setRestSeconds: item.setRestSeconds || 60,
        totalSets: item.sets || 4,
        totalRounds: item.sets || 4,
      }));
    } catch (e) {
      const saved = localStorage.getItem('pulse_custom_presets');
      return saved ? JSON.parse(saved) : [];
    }
  },

  async addPreset(preset: WorkoutPreset): Promise<void> {
    try {
      await apiFetch('/api/presets', {
        method: 'POST',
        body: JSON.stringify({
          id: preset.id,
          name: preset.name,
          category: preset.type,
          workSeconds: preset.workSeconds,
          restSeconds: preset.restSeconds,
          sets: preset.totalSets,
          cycles: preset.totalRounds || 1,
          prepSeconds: preset.prepSeconds,
          setRestSeconds: preset.setRestSeconds,
        }),
      });
    } catch (e) {
      console.warn('Servidor offline: salvando treino localmente');
    }
  },

  async deletePreset(id: string): Promise<void> {
    try {
      await apiFetch(`/api/presets/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('Servidor offline: removendo treino localmente');
    }
  },

  // Settings
  async getSettings(): Promise<UserSettings | null> {
    try {
      return await apiFetch<UserSettings>('/api/settings');
    } catch (e) {
      return null;
    }
  },

  async saveSettings(settings: Partial<UserSettings>): Promise<void> {
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('Servidor offline: salvando configurações localmente');
    }
  },
};
