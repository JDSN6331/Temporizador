import React from 'react';
import { WorkoutPreset, UserProfile, WorkoutHistoryItem } from '../types';

interface SideMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPreset: (preset: WorkoutPreset) => void;
  onNavigate: (tab: 'home' | 'history' | 'analytics' | 'settings') => void;
}

export const SideMenuDrawer: React.FC<SideMenuDrawerProps> = ({
  isOpen,
  onClose,
  onStartPreset,
  onNavigate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex">
      <div className="w-80 max-w-[80vw] bg-[#131313] border-r border-[#201f1f] h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#201f1f]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-accent text-accent-dark rounded-xl flex items-center justify-center font-black text-xs shadow-[0_0_10px_var(--accent-glow)] shrink-0">
                P&P
              </div>
              <h2 className="font-extrabold text-base text-accent uppercase tracking-tighter">
                PULSE & PRECISION
              </h2>
            </div>
            <button onClick={onClose} className="text-[#c6c9ab] hover:text-white p-1 cursor-pointer">
              <i className="fi fi-rr-cross text-lg" />
            </button>
          </div>

          {/* Nav Items */}
          <div className="space-y-2 mb-8 font-label-caps text-xs">
            <button
              onClick={() => {
                onNavigate('home');
                onClose();
              }}
              className="w-full text-left py-3 px-4 rounded-xl bg-[#201f1f] text-accent font-bold flex items-center gap-3 hover:bg-[#2a2a2a] cursor-pointer"
            >
              <i className="fi fi-rr-home text-base" />
              HOME / DASHBOARD
            </button>
            <button
              onClick={() => {
                onNavigate('history');
                onClose();
              }}
              className="w-full text-left py-3 px-4 rounded-xl text-[#e5e2e1] hover:bg-[#201f1f] flex items-center gap-3 cursor-pointer"
            >
              <i className="fi fi-rr-time-past text-base" />
              MEUS TREINOS
            </button>
            <button
              onClick={() => {
                onNavigate('analytics');
                onClose();
              }}
              className="w-full text-left py-3 px-4 rounded-xl text-[#e5e2e1] hover:bg-[#201f1f] flex items-center gap-3 cursor-pointer"
            >
              <i className="fi fi-rr-stats text-base" />
              ANÁLISE DE PROGRESSO
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                onClose();
              }}
              className="w-full text-left py-3 px-4 rounded-xl text-[#e5e2e1] hover:bg-[#201f1f] flex items-center gap-3 cursor-pointer"
            >
              <i className="fi fi-rr-settings text-base" />
              CONFIGURAÇÕES
            </button>
          </div>

        </div>

        <div className="pt-6 border-t border-[#201f1f] text-center font-label-caps text-[10px] text-[#c6c9ab]">
          PULSE & PRECISION • HIGH INTENSITY ATHLETE
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  historyItems?: WorkoutHistoryItem[];
  onLogout: () => void;
  onOpenLogin: () => void;
  onUpdateUser?: (updated: UserProfile) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  user,
  historyItems = [],
  onLogout,
  onOpenLogin,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && onUpdateUser) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateUser({
          ...user,
          avatarUrl: base64,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoalChange = (delta: number) => {
    if (user && onUpdateUser) {
      const currentGoal = user.weeklyGoal || 5;
      const newGoal = Math.max(1, Math.min(14, currentGoal + delta));
      onUpdateUser({
        ...user,
        weeklyGoal: newGoal,
      });
    }
  };

  // Compute dynamic stats from history
  const totalCompleted = historyItems.length;
  const weeklyGoal = user?.weeklyGoal || 5;

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thisWeekCompleted = historyItems.filter((item) => {
    const itemTime = item.timestamp || Date.now();
    return new Date(itemTime) >= sevenDaysAgo;
  }).length;

  // Streak calculation
  const activeDates = new Set<string>();
  historyItems.forEach((item) => {
    const d = new Date(item.timestamp || Date.now());
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    activeDates.add(dateStr);
  });

  let streak = 0;
  let checkDate = new Date();
  checkDate.setHours(0, 0, 0, 0);

  const todayStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
  if (!activeDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (activeDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="flex-1" onClick={onClose} />
      <div className="w-80 max-w-[80vw] bg-[#131313] border-l border-[#201f1f] h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#201f1f]">
            <h2 className="font-extrabold text-base text-[#e5e2e1] uppercase tracking-tight">
              PERFIL DO ATLETA
            </h2>
            <button onClick={onClose} className="text-[#c6c9ab] hover:text-white p-1 cursor-pointer">
              <i className="fi fi-rr-cross text-lg" />
            </button>
          </div>

          {user?.isLoggedIn ? (
            <>
              {/* Logged in User Card */}
              <div className="text-center mb-6 glass-card p-5 rounded-2xl relative group">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                
                {/* Avatar with Clickable Upload Badge */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 mx-auto mb-3 cursor-pointer group/avatar"
                  title="Clique para alterar a foto do perfil"
                >
                  <div className="w-20 h-20 bg-accent text-accent-dark rounded-full flex items-center justify-center font-black text-2xl shadow-[0_0_20px_var(--accent-glow)] overflow-hidden border-2 border-accent">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <i className="fi fi-rr-camera text-white text-2xl" />
                  </div>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-label-caps text-accent hover:underline mb-2 block mx-auto cursor-pointer"
                >
                  ALTERAR FOTO
                </button>

                <h3 className="font-bold text-lg text-[#e5e2e1]">{user.name}</h3>
                <p className="font-label-caps text-xs text-[#c6c9ab] mb-1">{user.email}</p>
                <span className="inline-block font-label-caps text-[10px] text-accent bg-accent/10 border border-accent/30 px-3 py-0.5 rounded-full mt-1 font-bold">
                  ATLETA AUTENTICADO
                </span>
              </div>

              <div className="space-y-3 font-label-caps text-xs">
                <div className="bg-[#0e0e0e] p-3 rounded-xl border border-[#201f1f] flex justify-between items-center">
                  <span className="text-[#c6c9ab]">SESSÕES CONCLUÍDAS</span>
                  <span className="text-[#e5e2e1] font-bold">{totalCompleted} {totalCompleted === 1 ? 'TREINO' : 'TREINOS'}</span>
                </div>
                <div className="bg-[#0e0e0e] p-3 rounded-xl border border-[#201f1f] flex justify-between items-center">
                  <span className="text-[#c6c9ab]">SEQUÊNCIA ATUAL</span>
                  <span className="text-[#ffb4aa] font-bold">{streak} {streak === 1 ? 'DIA' : 'DIAS'} 🔥</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center bg-[#201f1f] p-6 rounded-2xl border border-[#353534] my-6">
              <div className="w-16 h-16 bg-[#353534] text-accent rounded-full mx-auto mb-3 flex items-center justify-center">
                <i className="fi fi-rr-user text-2xl" />
              </div>
              <h3 className="font-bold text-base text-[#e5e2e1] mb-1">Você não está conectado</h3>
              <p className="text-xs text-[#c6c9ab] mb-5">
                Faça login para sincronizar seu histórico e manter o progresso salvo.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="w-full py-3 bg-accent text-accent-dark font-black font-label-caps text-xs rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_var(--accent-glow)] cursor-pointer"
              >
                ENTRAR / CADASTRAR
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-4">
          {user?.isLoggedIn && (
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 bg-[#c5020b]/20 border border-[#c5020b]/40 text-[#ffb4aa] font-label-caps text-xs rounded-xl font-bold hover:bg-[#c5020b]/30 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fi fi-rr-exit text-sm" />
              SAIR DA CONTA
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#353534] text-[#e5e2e1] font-label-caps text-xs rounded-xl font-bold hover:bg-[#393939] cursor-pointer"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};

