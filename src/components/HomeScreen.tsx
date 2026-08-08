import React from 'react';
import { WorkoutPreset, WorkoutHistoryItem } from '../types';

interface HomeScreenProps {
  onStartWorkout: (preset: WorkoutPreset) => void;
  onOpenCustomBuilder: () => void;
  lastSession?: WorkoutHistoryItem;
  onViewHistory: () => void;
  customPresets?: WorkoutPreset[];
  onDeleteCustomPreset?: (id: string) => void;
  weeklyGoal?: number;
  historyItems?: WorkoutHistoryItem[];
}

export const defaultPresets: WorkoutPreset[] = [
  {
    id: 'tabata',
    name: 'Tabata High Intensity',
    type: 'TABATA',
    subtitle: '20s W / 10s R • 8 EX × 4 SETS',
    workSeconds: 20,
    restSeconds: 10,
    prepSeconds: 10,
    exercisesPerSet: 8,
    setRestSeconds: 60,
    totalSets: 4,
    totalRounds: 32,
    intensity: 'ALTA INTENSIDADE',
  },
  {
    id: 'emom',
    name: 'EMOM Power Endurance',
    type: 'EMOM',
    subtitle: '60s W / 0s R • 10 EX × 3 SETS',
    workSeconds: 60,
    restSeconds: 0,
    prepSeconds: 10,
    exercisesPerSet: 10,
    setRestSeconds: 90,
    totalSets: 3,
    totalRounds: 30,
    intensity: 'ALTA INTENSIDADE',
  },
  {
    id: 'amrap',
    name: 'AMRAP Max Effort',
    type: 'AMRAP',
    subtitle: '45s W / 15s R • 6 EX × 4 SETS',
    workSeconds: 45,
    restSeconds: 15,
    prepSeconds: 10,
    exercisesPerSet: 6,
    setRestSeconds: 60,
    totalSets: 4,
    totalRounds: 24,
    intensity: 'MÁXIMA',
  },
  {
    id: 'custom',
    name: 'Treino Personalizado',
    type: 'CUSTOM',
    subtitle: '30s W / 15s R • SÉRIES CUSTOM',
    workSeconds: 30,
    restSeconds: 15,
    prepSeconds: 5,
    exercisesPerSet: 8,
    setRestSeconds: 60,
    totalSets: 3,
    totalRounds: 24,
    intensity: 'MÉDIA INTENSIDADE',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartWorkout,
  onOpenCustomBuilder,
  lastSession,
  onViewHistory,
  customPresets = [],
  onDeleteCustomPreset,
  weeklyGoal = 5,
  historyItems = [],
}) => {
  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const thisWeekCompleted = historyItems.filter((item) => {
    const itemTime = item.timestamp || Date.now();
    return new Date(itemTime) >= sevenDaysAgo;
  }).length;

  return (
    <main className="flex-1 overflow-y-auto px-6 pt-3 pb-28 max-w-[600px] mx-auto w-full space-y-6">
      {/* Explicit Weekly Goal Progress Card */}
      <div className="glass-card rounded-2xl p-4 space-y-2.5 shadow-md">
        <div className="flex items-center justify-between text-xs font-label-caps font-bold">
          <span className="text-[#c6c9ab] flex items-center gap-1.5">
            <i className="fi fi-rr-flag text-accent text-sm" />
            META SEMANAL DE TREINOS
          </span>
          <span className="text-accent">{thisWeekCompleted} / {weeklyGoal} SESSÕES</span>
        </div>
        <div className="w-full h-2.5 bg-[#131313] rounded-full overflow-hidden border border-[#353534]">
          <div
            className="h-full bg-accent rounded-full shadow-[0_0_10px_var(--accent-glow)] transition-all duration-500"
            style={{ width: `${Math.min(100, (thisWeekCompleted / Math.max(1, weeklyGoal)) * 100)}%` }}
          />
        </div>
      </div>

      {/* QUICK START SECTION */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-xl text-[#e5e2e1] uppercase tracking-tight">
            Quick Start
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Tabata */}
          <button
            onClick={() => onStartWorkout(defaultPresets[0])}
            className="glass-card rounded-2xl p-4 flex flex-col justify-start gap-2.5 hover:bg-[#2a2a2a]/80 transition-all duration-200 group active:scale-[0.98] text-left hover:border-accent/60 cursor-pointer"
          >
            <div className="bg-accent/20 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <i className="fi fi-rr-time-fast text-accent text-xl" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-extrabold text-base text-[#e5e2e1] leading-tight mb-0.5 truncate">
                Tabata
              </h3>
              <p className="font-label-caps text-xs text-[#c6c9ab] truncate">20s W / 10s R</p>
              <p className="font-label-caps text-[10px] text-accent mt-1 font-bold truncate">
                8 EX × 4 SETS
              </p>
            </div>
          </button>

          {/* EMOM */}
          <button
            onClick={() => onStartWorkout(defaultPresets[1])}
            className="glass-card rounded-2xl p-4 flex flex-col justify-start gap-2.5 hover:bg-[#2a2a2a]/80 transition-all duration-200 group active:scale-[0.98] text-left hover:border-[#ffb4aa]/60 cursor-pointer"
          >
            <div className="bg-[#c5020b]/20 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#c5020b]/30 transition-colors">
              <i className="fi fi-rr-clock-three text-[#ffb4aa] text-xl" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-extrabold text-base text-[#e5e2e1] leading-tight mb-0.5 truncate">
                EMOM
              </h3>
              <p className="font-label-caps text-xs text-[#c6c9ab] truncate">1 MIN ROUNDS</p>
              <p className="font-label-caps text-[10px] text-[#ffb4aa] mt-1 font-bold truncate">
                10 EX × 3 SETS
              </p>
            </div>
          </button>

          {/* AMRAP */}
          <button
            onClick={() => onStartWorkout(defaultPresets[2])}
            className="glass-card rounded-2xl p-4 flex flex-col justify-start gap-2.5 hover:bg-[#2a2a2a]/80 transition-all duration-200 group active:scale-[0.98] text-left hover:border-[#d8e2ff]/60 cursor-pointer"
          >
            <div className="bg-[#d8e2ff]/20 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#d8e2ff]/30 transition-colors">
              <i className="fi fi-rr-rotate-right text-[#d8e2ff] text-xl" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-extrabold text-base text-[#e5e2e1] leading-tight mb-0.5 truncate">
                AMRAP
              </h3>
              <p className="font-label-caps text-xs text-[#c6c9ab] truncate">MAX EFFORT</p>
              <p className="font-label-caps text-[10px] text-[#d8e2ff] mt-1 font-bold truncate">
                6 EX × 4 SETS
              </p>
            </div>
          </button>

          {/* CUSTOM PRESETS CARDS CREATED BY USER */}
          {customPresets.map((preset) => (
            <div key={preset.id} className="relative group">
              <button
                onClick={() => onStartWorkout(preset)}
                className="w-full glass-card rounded-2xl p-4 flex flex-col justify-start gap-2.5 hover:bg-[#2a2a2a]/80 transition-all duration-200 group active:scale-[0.98] text-left border-accent/40 hover:border-accent cursor-pointer h-full"
              >
                <div className="bg-accent/20 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <i className="fi fi-rr-sliders-h text-accent text-xl" />
                </div>
                <div className="w-full min-w-0 pr-4">
                  <h3 className="font-extrabold text-base text-[#e5e2e1] leading-tight mb-0.5 truncate">
                    {preset.name}
                  </h3>
                  <p className="font-label-caps text-xs text-[#c6c9ab] truncate">
                    {preset.workSeconds}s W / {preset.restSeconds}s R
                  </p>
                  <p className="font-label-caps text-[10px] text-accent mt-1 font-bold truncate">
                    {preset.exercisesPerSet} EX × {preset.totalSets} SETS
                  </p>
                </div>
              </button>
              {onDeleteCustomPreset && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCustomPreset(preset.id);
                  }}
                  className="absolute top-2 right-2 p-1 text-[#c6c9ab] hover:text-[#ffb4aa] hover:bg-[#131313] rounded-lg transition-colors cursor-pointer"
                  title="Excluir treino personalizado"
                >
                  <i className="fi fi-rr-trash text-xs" />
                </button>
              )}
            </div>
          ))}

          {/* Personalizado (Crie o seu) */}
          <button
            onClick={onOpenCustomBuilder}
            className="glass-card rounded-2xl p-4 flex flex-col justify-start gap-2.5 hover:bg-[#2a2a2a]/80 transition-all duration-200 group active:scale-[0.98] text-left hover:border-accent/60 cursor-pointer"
          >
            <div className="bg-[#353534] w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-[#393939] transition-colors">
              <i className="fi fi-rr-add text-accent text-xl" />
            </div>
            <div className="w-full min-w-0">
              <h3 className="font-extrabold text-base text-[#e5e2e1] leading-tight mb-0.5 truncate">
                Personalizado
              </h3>
              <p className="font-label-caps text-xs text-[#c6c9ab] truncate">CRIE O SEU</p>
              <p className="font-label-caps text-[10px] text-accent mt-1 font-bold truncate">
                CONFIGURÁVEL
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* LAST SESSION SECTION */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-extrabold text-xl text-[#e5e2e1] uppercase tracking-tight">
            Último Treino Realizado
          </h2>
          <button
            onClick={onViewHistory}
            className="text-xs font-label-caps text-accent flex items-center gap-1 cursor-pointer group"
          >
            <span className="group-hover:underline">VER HISTÓRICO</span>
            <i className="fi fi-rr-angle-small-right text-sm group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {lastSession ? (
          <div
            onClick={() => {
              onStartWorkout({
                id: `replay_${Date.now()}`,
                name: lastSession.title,
                type: lastSession.type,
                subtitle: `${lastSession.roundsCompleted} ROUNDS`,
                workSeconds: 45,
                restSeconds: 15,
                prepSeconds: 5,
                exercisesPerSet: 8,
                setRestSeconds: 60,
                totalSets: 4,
                totalRounds: lastSession.totalRounds,
              });
            }}
            className="glass-card rounded-2xl p-5 flex items-center justify-between hover:border-accent/50 transition-colors cursor-pointer group active:scale-[0.99]"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="bg-accent text-accent-dark w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_15px_var(--accent-glow)] shrink-0 font-bold">
                <i className="fi fi-rr-check-circle text-xl" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-base text-[#e5e2e1] mb-0.5 group-hover:text-accent transition-colors truncate">
                  {lastSession.title}
                </p>
                <p className="font-label-caps text-xs text-[#c6c9ab] opacity-90 tracking-wider truncate">
                  {lastSession.dateStr} • {lastSession.roundsCompleted} ROUNDS ({lastSession.durationMinutes} MIN)
                </p>
              </div>
            </div>
            <button className="text-accent group-hover:translate-x-1 transition-transform p-2 rounded-full hover:bg-accent/10 shrink-0 cursor-pointer">
              <i className="fi fi-rr-refresh text-xl" />
            </button>
          </div>
        ) : (
          <div className="bg-[#201f1f] rounded-2xl p-5 border border-[#353534] text-center">
            <h3 className="font-bold text-xs text-[#c6c9ab] uppercase font-label-caps tracking-wider">
              Nenhum treino registrado ainda
            </h3>
          </div>
        )}
      </section>

      {/* CUSTOM PRESETS CREATED BY USER (IF ANY) */}
      {customPresets.length > 0 && (
        <section>
          <h3 className="font-label-caps text-xs text-[#c6c9ab] uppercase mb-3 tracking-widest">
            SEUS PRESETS SALVOS
          </h3>
          <div className="space-y-2.5">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => onStartWorkout(preset)}
                className="bg-[#201f1f] rounded-xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-[#2a2a2a] cursor-pointer border border-[#353534] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-label-caps text-xs text-accent bg-accent/10 border border-accent/30 px-2 py-0.5 rounded shrink-0">
                    {preset.type}
                  </span>
                  <span className="font-bold text-sm text-[#e5e2e1] truncate">{preset.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-label-caps text-[#c6c9ab] shrink-0">
                  <span>{preset.workSeconds}s W / {preset.restSeconds}s R</span>
                  <span className="text-accent font-bold bg-[#131313] px-2 py-0.5 rounded border border-[#353534]">
                    {preset.exercisesPerSet} EX × {preset.totalSets} SETS
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

