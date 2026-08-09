import React, { useState, useEffect, useRef } from 'react';
import { WorkoutPreset, TimerPhase, WorkoutHistoryItem } from '../types';
import { playCountdownBeep, playPhaseChangeSound, unlockAudio } from '../utils/sound';

interface WorkoutTimerScreenProps {
  preset: WorkoutPreset;
  onFinishWorkout: (historyItem: WorkoutHistoryItem) => void;
  onCancel: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const WorkoutTimerScreen: React.FC<WorkoutTimerScreenProps> = ({
  preset,
  onFinishWorkout,
  onCancel,
  soundEnabled,
  onToggleSound,
}) => {
  const exercisesPerSet = preset.exercisesPerSet || 8;
  const totalSets = preset.totalSets || 4;
  const setRestSeconds = preset.setRestSeconds ?? 60;

  // Calculate total workout duration and remaining countdown
  const prepSec = preset.prepSeconds ?? 5;
  const totalWorkoutSeconds =
    prepSec +
    totalSets * exercisesPerSet * preset.workSeconds +
    totalSets * Math.max(0, exercisesPerSet - 1) * (preset.restSeconds || 0) +
    Math.max(0, totalSets - 1) * setRestSeconds;

  const [phase, setPhase] = useState<TimerPhase>('PREPARE');
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [currentExercise, setCurrentExercise] = useState<number>(1);
  const [secondsLeft, setSecondsLeft] = useState<number>(preset.prepSeconds || 5);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [showCompletedModal, setShowCompletedModal] = useState<boolean>(false);

  const totalRemainingSeconds = Math.max(0, totalWorkoutSeconds - totalElapsedSeconds);

  const lastTickTimeRef = useRef<number>(Date.now());

  // Keep ref to avoid stale closures in setInterval
  const stateRef = useRef({
    phase,
    currentSet,
    currentExercise,
    secondsLeft,
    isPaused,
    soundEnabled,
    exercisesPerSet,
    totalSets,
    setRestSeconds,
    preset,
  });

  stateRef.current = {
    phase,
    currentSet,
    currentExercise,
    secondsLeft,
    isPaused,
    soundEnabled,
    exercisesPerSet,
    totalSets,
    setRestSeconds,
    preset,
  };

  // Synchronize document title with current timer state so user sees it on browser tab
  useEffect(() => {
    if (phase === 'FINISHED') {
      document.title = '🎉 Treino Concluído! - Pulse & Precision';
    } else if (!isPaused) {
      const minStr = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
      const secStr = (secondsLeft % 60).toString().padStart(2, '0');
      document.title = `⏱️ ${minStr}:${secStr} [${phase}] - Pulse & Precision`;
    } else {
      document.title = '⏸️ Pausado - Pulse & Precision';
    }

    return () => {
      document.title = 'Pulse & Precision - Timer de Treino HIIT & Tabata';
    };
  }, [secondsLeft, phase, isPaused]);

  // Unlock Web Audio context on screen load
  useEffect(() => {
    unlockAudio();
  }, []);

  // Prevent mobile screen from locking/sleeping during active workout
  useEffect(() => {
    let wakeLockSentinel: any = null;

    const requestScreenLock = async () => {
      if ('wakeLock' in navigator && !isPaused && phase !== 'FINISHED') {
        try {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        } catch (e) {
          /* ignore wake lock errors */
        }
      }
    };

    requestScreenLock();

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isPaused, phase]);

  // Sync with MediaSession API for mobile lock screen & background media controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        const remainingStr = Math.floor(totalRemainingSeconds / 60) + 'm ' + (totalRemainingSeconds % 60) + 's';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: `[${phase}] ${formatTime(secondsLeft)}`,
          artist: `Treino: ${preset.name} (${remainingStr} restantes)`,
          album: 'Pulse & Precision HIIT',
        });

        navigator.mediaSession.setActionHandler('play', () => setIsPaused(false));
        navigator.mediaSession.setActionHandler('pause', () => setIsPaused(true));
      } catch (e) {
        /* ignore */
      }
    }
  }, [phase, secondsLeft, totalRemainingSeconds, isPaused, preset.name]);

  useEffect(() => {
    lastTickTimeRef.current = Date.now();

    const processDelta = (elapsedSeconds: number) => {
      if (elapsedSeconds <= 0) return;

      let {
        phase: currentPhase,
        currentSet: curSet,
        currentExercise: curEx,
        secondsLeft: curSec,
        isPaused: paused,
        soundEnabled: soundOn,
        exercisesPerSet: exPerSet,
        totalSets: maxSets,
        setRestSeconds: sRestSec,
        preset: p,
      } = stateRef.current;

      if (paused || showQuitConfirm || showCompletedModal) return;

      setTotalElapsedSeconds((prev) => prev + elapsedSeconds);

      let remainingToDeduct = elapsedSeconds;

      while (remainingToDeduct > 0) {
        if (curSec > remainingToDeduct) {
          curSec -= remainingToDeduct;
          setSecondsLeft(curSec);
          if (curSec <= 3 && remainingToDeduct === 1) {
            playCountdownBeep(curSec, soundOn);
          }
          remainingToDeduct = 0;
        } else {
          // Current phase completed!
          remainingToDeduct -= curSec;
          playCountdownBeep(0, soundOn);

          if (currentPhase === 'PREPARE') {
            currentPhase = 'TRABALHO';
            curSec = p.workSeconds;
            setPhase('TRABALHO');
            setSecondsLeft(curSec);
            playPhaseChangeSound('TRABALHO', soundOn);
          } else if (currentPhase === 'TRABALHO') {
            if (curEx < exPerSet) {
              if (p.restSeconds > 0) {
                currentPhase = 'DESCANSO';
                curSec = p.restSeconds;
                setPhase('DESCANSO');
                setSecondsLeft(curSec);
                playPhaseChangeSound('DESCANSO', soundOn);
              } else {
                curEx += 1;
                currentPhase = 'TRABALHO';
                curSec = p.workSeconds;
                setCurrentExercise(curEx);
                setPhase('TRABALHO');
                setSecondsLeft(curSec);
                playPhaseChangeSound('TRABALHO', soundOn);
              }
            } else {
              // Completed all exercises in current set
              if (curSet < maxSets) {
                if (sRestSec > 0) {
                  currentPhase = 'DESCANSO_SERIE';
                  curSec = sRestSec;
                  setPhase('DESCANSO_SERIE');
                  setSecondsLeft(curSec);
                  playPhaseChangeSound('DESCANSO', soundOn);
                } else {
                  curSet += 1;
                  curEx = 1;
                  currentPhase = 'TRABALHO';
                  curSec = p.workSeconds;
                  setCurrentSet(curSet);
                  setCurrentExercise(curEx);
                  setPhase('TRABALHO');
                  setSecondsLeft(curSec);
                  playPhaseChangeSound('TRABALHO', soundOn);
                }
              } else {
                // Workout Finished!
                setPhase('FINISHED');
                setShowCompletedModal(true);
                playPhaseChangeSound('FINISHED', soundOn);
                try {
                  if ('vibrate' in navigator) navigator.vibrate([300, 150, 300]);
                } catch (e) {
                  /* ignore */
                }
                break;
              }
            }
          } else if (currentPhase === 'DESCANSO') {
            curEx += 1;
            currentPhase = 'TRABALHO';
            curSec = p.workSeconds;
            setCurrentExercise(curEx);
            setPhase('TRABALHO');
            setSecondsLeft(curSec);
            playPhaseChangeSound('TRABALHO', soundOn);
          } else if (currentPhase === 'DESCANSO_SERIE') {
            curSet += 1;
            curEx = 1;
            currentPhase = 'TRABALHO';
            curSec = p.workSeconds;
            setCurrentSet(curSet);
            setCurrentExercise(curEx);
            setPhase('TRABALHO');
            setSecondsLeft(curSec);
            playPhaseChangeSound('TRABALHO', soundOn);
          }
        }
      }
    };

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastTickTimeRef.current) / 1000);
      if (elapsed >= 1) {
        lastTickTimeRef.current = now;
        processDelta(elapsed);
      }
    }, 250);

    // Sync state immediately when user switches back from Spotify/other tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickTimeRef.current) / 1000);
        if (elapsed >= 1) {
          lastTickTimeRef.current = now;
          processDelta(elapsed);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showQuitConfirm, showCompletedModal]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePauseToggle = () => {
    setIsPaused((prev) => !prev);
  };

  const handleSkipPhase = () => {
    const {
      phase: currentPhase,
      currentSet: curSet,
      currentExercise: curEx,
      exercisesPerSet: exPerSet,
      totalSets: maxSets,
      setRestSeconds: sRestSec,
      preset: p,
    } = stateRef.current;

    if (currentPhase === 'PREPARE') {
      setPhase('TRABALHO');
      setSecondsLeft(p.workSeconds);
    } else if (currentPhase === 'TRABALHO') {
      if (curEx < exPerSet) {
        if (p.restSeconds > 0) {
          setPhase('DESCANSO');
          setSecondsLeft(p.restSeconds);
        } else {
          setCurrentExercise(curEx + 1);
          setSecondsLeft(p.workSeconds);
        }
      } else if (curSet < maxSets) {
        if (sRestSec > 0) {
          setPhase('DESCANSO_SERIE');
          setSecondsLeft(sRestSec);
        } else {
          setCurrentSet(curSet + 1);
          setCurrentExercise(1);
          setSecondsLeft(p.workSeconds);
        }
      } else {
        setPhase('FINISHED');
        setShowCompletedModal(true);
      }
    } else if (currentPhase === 'DESCANSO') {
      setCurrentExercise(curEx + 1);
      setPhase('TRABALHO');
      setSecondsLeft(p.workSeconds);
    } else if (currentPhase === 'DESCANSO_SERIE') {
      setCurrentSet(curSet + 1);
      setCurrentExercise(1);
      setPhase('TRABALHO');
      setSecondsLeft(p.workSeconds);
    }
  };

  const handleSaveAndExit = () => {
    const durationMin = Math.max(1, Math.round(totalElapsedSeconds / 60));
    const now = new Date();
    const dateStr = `HOJE, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newHistory: WorkoutHistoryItem = {
      id: `w_${Date.now()}`,
      title: `${preset.name} Workout`,
      dateStr,
      timestamp: Date.now(),
      durationMinutes: durationMin,
      roundsCompleted: (currentSet - 1) * exercisesPerSet + currentExercise,
      totalRounds: exercisesPerSet * totalSets,
      intensity: preset.intensity,
      type: preset.type,
      colorBorder: preset.type === 'TABATA' ? 'border-[#d2f000]' : preset.type === 'EMOM' ? 'border-[#ffb4aa]' : 'border-[#d8e2ff]',
      iconName: preset.type === 'TABATA' ? 'local_fire_department' : preset.type === 'EMOM' ? 'timer' : 'fitness_center',
    };

    onFinishWorkout(newHistory);
  };

  // Phase color themes
  const getPhaseTheme = () => {
    if (phase === 'PREPARE') {
      return {
        label: 'PREPARAÇÃO',
        textColor: 'text-[#adc6ff]',
        borderColor: 'border-[#adc6ff]',
        glowClass: 'prepare-glow',
        textGlow: 'text-glow-blue',
        bgPill: 'bg-[#004493]/30',
        nextText: `Série 1 • Ex. 1 (${formatTime(preset.workSeconds)})`,
      };
    } else if (phase === 'TRABALHO') {
      const isLastExInSet = currentExercise === exercisesPerSet;
      const nextPhaseName = isLastExInSet
        ? (currentSet < totalSets && setRestSeconds > 0 ? `Descanso de Série (${formatTime(setRestSeconds)})` : 'Próxima Série')
        : preset.restSeconds > 0
        ? `Descanso (${formatTime(preset.restSeconds)})`
        : `Ex. ${currentExercise + 1}`;

      return {
        label: 'TRABALHO',
        textColor: 'text-accent',
        borderColor: 'border-accent',
        glowClass: 'timer-glow',
        textGlow: 'text-glow',
        bgPill: 'bg-accent/20',
        nextText: nextPhaseName,
      };
    } else if (phase === 'DESCANSO') {
      return {
        label: 'DESCANSO',
        textColor: 'text-[#ffb4aa]',
        borderColor: 'border-[#ffb4aa]',
        glowClass: 'rest-glow',
        textGlow: 'text-glow-red',
        bgPill: 'bg-[#c5020b]/30',
        nextText: `Ex. ${currentExercise + 1} (${formatTime(preset.workSeconds)})`,
      };
    } else {
      // DESCANSO_SERIE
      return {
        label: 'DESCANSO ENTRE SÉRIES',
        textColor: 'text-[#ffb4aa]',
        borderColor: 'border-accent',
        glowClass: 'timer-glow',
        textGlow: 'text-glow',
        bgPill: 'bg-accent/20',
        nextText: `Série ${currentSet + 1}/${totalSets} (${formatTime(preset.workSeconds)})`,
      };
    }
  };

  const theme = getPhaseTheme();

  // Progress percentage for circular ring animation
  const maxPhaseDuration =
    phase === 'PREPARE'
      ? preset.prepSeconds || 5
      : phase === 'TRABALHO'
      ? preset.workSeconds
      : phase === 'DESCANSO'
      ? preset.restSeconds || 1
      : setRestSeconds || 1;
  const progressPercent = Math.min(100, Math.max(0, ((maxPhaseDuration - secondsLeft) / maxPhaseDuration) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-[#131313] text-[#e5e2e1] flex flex-col justify-between overflow-hidden">
      {/* TOP HEADER CONTROLS */}
      <div className="h-16 w-full px-6 flex items-center justify-between border-b border-[#201f1f]">
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="text-[#c6c9ab] hover:text-[#e5e2e1] font-label-caps text-xs flex items-center gap-1.5 p-2 rounded-lg hover:bg-[#201f1f] cursor-pointer"
        >
          <i className="fi fi-rr-angle-left text-lg" />
          <span>SAIR</span>
        </button>

        <div className="text-center font-label-caps text-xs text-[#c6c9ab] uppercase tracking-widest truncate max-w-[200px] sm:max-w-none">
          {preset.name} • {exercisesPerSet} EX × {totalSets} SETS
        </div>

        <button
          onClick={onToggleSound}
          className="text-accent p-2 rounded-lg hover:bg-[#201f1f] transition-colors cursor-pointer"
          title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
        >
          <i className={`fi ${soundEnabled ? 'fi-rr-volume' : 'fi-rr-volume-mute'} text-xl`} />
        </button>
      </div>

      {/* MAIN TIMER CANVAS */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 w-full max-w-[600px] mx-auto py-4">
        {/* PHASE TITLE */}
        <div className="mb-4 text-center">
          <span
            className={`font-black text-2xl sm:text-4xl md:text-5xl uppercase tracking-widest ${theme.textColor} ${theme.textGlow} transition-colors duration-300 block`}
          >
            {theme.label}
          </span>
          {isPaused && (
            <div className="mt-2 text-xs font-label-caps bg-[#ffb4aa]/20 text-[#ffb4aa] px-3 py-1 rounded-full animate-pulse inline-block">
              EM PAUSA
            </div>
          )}
        </div>

        {/* TIMER CIRCLE */}
        <div
          className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-[#201f1f] neomorphic-inset flex flex-col items-center justify-center ${theme.glowClass} mb-6 border-[4px] ${theme.borderColor} transition-all duration-300`}
        >
          {/* Progress Ring Simulation */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * progressPercent) / 100}
              strokeLinecap="round"
              className={`${theme.textColor} transition-all duration-500`}
            />
          </svg>

          {/* TIMER DIGITS */}
          <div
            className={`font-black text-5xl sm:text-7xl md:text-8xl ${theme.textColor} ${theme.textGlow} z-10 tabular-nums tracking-tighter`}
          >
            {formatTime(secondsLeft)}
          </div>

          {/* EXERCISE & SET COUNTER INSIDE CIRCLE */}
          <div className="absolute bottom-8 sm:bottom-10 flex flex-col items-center gap-0.5 font-label-caps text-xs text-[#c6c9ab] tracking-widest uppercase">
            <span className="text-accent font-bold">
              SÉRIE {currentSet}/{totalSets}
            </span>
            <span className="text-[11px] opacity-80">
              EXERCÍCIO {currentExercise}/{exercisesPerSet}
            </span>
          </div>
        </div>

        {/* TOTAL WORKOUT COUNTDOWN CARD */}
        <div className="bg-[#0e0e0e] px-4 py-2.5 rounded-2xl border border-[#353534] flex items-center justify-between shadow-lg w-full max-w-sm mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <i className="fi fi-rr-time-fast text-accent text-lg shrink-0" />
            <div className="flex flex-col text-left min-w-0">
              <span className="font-label-caps text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                TEMPO TOTAL RESTANTE
              </span>
              <span className="font-mono font-black text-sm text-accent tracking-wider">
                {formatTime(totalRemainingSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="font-label-caps text-[10px] text-[#c6c9ab] uppercase tracking-wider">
              DECORRIDO
            </span>
            <span className="font-mono font-bold text-xs text-[#e5e2e1]">
              {formatTime(totalElapsedSeconds)}
            </span>
          </div>
        </div>

        {/* UPCOMING PHASE CARD */}
        <div className="bg-[#0e0e0e] px-5 py-3 rounded-2xl border border-[#353534] flex items-center gap-3 shadow-lg w-full max-w-sm justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <i className="fi fi-rr-hourglass-end text-[#ffb4aa] text-xl shrink-0" />
            <div className="flex flex-col text-left min-w-0">
              <span className="font-label-caps text-[10px] text-[#c6c9ab] uppercase tracking-wider">
                PRÓXIMA ETAPA
              </span>
              <span className="font-bold text-sm text-[#e5e2e1] truncate">{theme.nextText}</span>
            </div>
          </div>
          <button
            onClick={handleSkipPhase}
            className="text-xs font-label-caps text-accent hover:bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/30 transition-colors shrink-0 cursor-pointer"
          >
            PULAR →
          </button>
        </div>
      </main>

      {/* BOTTOM CONTROLS FOOTER */}
      <footer className="w-full px-6 pb-8 pt-2 flex gap-4 max-w-[600px] mx-auto">
        {/* STOP BUTTON */}
        <button
          onClick={() => setShowQuitConfirm(true)}
          className="flex-1 bg-[#201f1f] rounded-2xl py-4 sm:py-5 flex flex-col items-center justify-center neomorphic-button text-[#ffb4aa] hover:bg-[#2a2a2a] transition-all active:scale-95 border border-[#ffb4aa]/20 cursor-pointer"
        >
          <i className="fi fi-rr-square text-xl sm:text-2xl mb-1" />
          <span className="font-label-caps text-[11px] tracking-wider">PARAR</span>
        </button>

        {/* PAUSE / RESUME MAIN ACTION BUTTON */}
        <button
          onClick={handlePauseToggle}
          className={`flex-[2] rounded-2xl py-4 sm:py-5 flex flex-col items-center justify-center neomorphic-button transition-all active:scale-95 bg-accent text-accent-dark shadow-[0_0_20px_var(--accent-glow)] cursor-pointer`}
        >
          <i className={`fi ${isPaused ? 'fi-rr-play' : 'fi-rr-pause'} text-2xl sm:text-3xl mb-1`} />
          <span className="font-label-caps text-xs tracking-wider font-extrabold">
            {isPaused ? 'CONTINUAR' : 'PAUSAR'}
          </span>
        </button>
      </footer>

      {/* QUIT CONFIRM MODAL */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-[#201f1f] border border-[#353534] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <i className="fi fi-rr-exclamation text-[#ffb4aa] text-4xl mb-3 block" />
            <h3 className="font-extrabold text-xl text-[#e5e2e1] mb-2">Encerrar Treino?</h3>
            <p className="text-sm text-[#c6c9ab] mb-6">
              Seu progresso atual deste treino será interrompido.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-3 bg-[#353534] text-[#e5e2e1] rounded-xl font-label-caps text-xs hover:bg-[#393939] cursor-pointer"
              >
                CONTINUAR
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-3 bg-[#c5020b] text-white rounded-xl font-label-caps text-xs font-bold hover:bg-[#93000a] cursor-pointer"
              >
                SAIR AGORA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED WORKOUT MODAL */}
      {showCompletedModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#201f1f] border border-accent rounded-3xl p-6 max-w-md w-full text-center shadow-[0_0_40px_var(--accent-glow)]">
            <div className="w-16 h-16 bg-accent text-accent-dark rounded-full flex items-center justify-center mx-auto mb-4 glow-active">
              <i className="fi fi-rr-trophy text-3xl font-bold" />
            </div>
            <h2 className="font-black text-3xl text-accent tracking-tight uppercase mb-1">
              Treino Concluído!
            </h2>
            <p className="font-label-caps text-xs text-[#c6c9ab] mb-6 tracking-widest">
              PARABÉNS! VOCÊ COMPLETOU O OBJETIVO.
            </p>

            <div className="bg-[#131313] rounded-2xl p-4 grid grid-cols-3 gap-3 mb-6 text-left border border-[#353534]">
              <div>
                <span className="font-label-caps text-[10px] text-[#c6c9ab] block uppercase">
                  Tempo Total
                </span>
                <span className="font-bold text-lg text-[#e5e2e1]">
                  {formatTime(totalElapsedSeconds)}
                </span>
              </div>
              <div>
                <span className="font-label-caps text-[10px] text-[#c6c9ab] block uppercase">
                  Séries
                </span>
                <span className="font-bold text-lg text-accent">
                  {currentSet}/{totalSets}
                </span>
              </div>
              <div>
                <span className="font-label-caps text-[10px] text-[#c6c9ab] block uppercase">
                  Intensidade
                </span>
                <span className="font-bold text-xs text-[#ffb4aa] uppercase block mt-1">
                  {preset.intensity}
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveAndExit}
              className="w-full py-4 bg-accent text-accent-dark rounded-2xl font-black font-label-caps text-sm tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_20px_var(--accent-glow)]"
            >
              SALVAR E CONCLUIR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
