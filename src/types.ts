export type WorkoutType = 'TABATA' | 'EMOM' | 'AMRAP' | 'CUSTOM' | 'RECOVERY' | 'STRENGTH';

export type TimerPhase = 'PREPARE' | 'TRABALHO' | 'DESCANSO' | 'DESCANSO_SERIE' | 'FINISHED';

export interface WorkoutPreset {
  id: string;
  name: string;
  type: WorkoutType;
  subtitle: string;
  workSeconds: number;          // Tempo de trabalho por exercício
  restSeconds: number;          // Descanso curto entre exercícios
  prepSeconds: number;          // Tempo de preparação
  exercisesPerSet: number;      // Número de exercícios por série (ex: 8)
  setRestSeconds: number;       // Descanso longo entre séries (ex: 60s)
  totalSets: number;            // Número de séries/rodadas (ex: 4)
  totalRounds?: number;         // Auxiliar
  intensity?: 'BAIXA INTENSIDADE' | 'MÉDIA INTENSIDADE' | 'ALTA INTENSIDADE' | 'MÁXIMA';
}

export interface WorkoutHistoryItem {
  id: string;
  title: string;
  dateStr: string; // e.g. "HOJE, 08:30" or "YESTERDAY"
  timestamp: number;
  durationMinutes: number;
  roundsCompleted: number;
  totalRounds: number;
  intensity?: 'BAIXA INTENSIDADE' | 'MÉDIA INTENSIDADE' | 'ALTA INTENSIDADE' | 'MÁXIMA';
  type: WorkoutType;
  colorBorder: string; // Tailwind border class e.g. "border-[#d2f000]"
  iconName: string;
  workSeconds?: number;
  restSeconds?: number;
  prepSeconds?: number;
  exercisesPerSet?: number;
  setRestSeconds?: number;
  totalSets?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  weeklyGoal?: number;
}

export interface UserSettings {
  soundEnabled: boolean;
  volume: number; // 0 to 1
  defaultPrepSeconds: number; // e.g. 5, 10, 15
  defaultSetRestSeconds: number; // e.g. 30, 60, 90
  themeMode: 'dark' | 'light';   // Exclusivamente Tema Escuro ou Tema Claro
  weeklyGoal: number; // default e.g. 5
  glassmorphismEnabled?: boolean;
}
