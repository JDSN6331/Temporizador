import React, { useState } from 'react';
import { WorkoutPreset } from '../types';

interface CustomWorkoutModalProps {
  onClose: () => void;
  onStartCustomWorkout: (preset: WorkoutPreset) => void;
  onSaveCustomPreset?: (preset: WorkoutPreset) => void;
}

export const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({
  onClose,
  onStartCustomWorkout,
  onSaveCustomPreset,
}) => {
  const [name, setName] = useState('Treino Personalizado');
  const [workSeconds, setWorkSeconds] = useState(20);
  const [restSeconds, setRestSeconds] = useState(10);
  const [prepSeconds, setPrepSeconds] = useState(10);
  const [exercisesPerSet, setExercisesPerSet] = useState(8);
  const [setRestDuration, setSetRestDuration] = useState(60);
  const [totalSets, setTotalSets] = useState(4);
  const [saveToHome, setSaveToHome] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customPreset: WorkoutPreset = {
      id: `custom_${Date.now()}`,
      name: name.trim() || 'Treino Personalizado',
      type: 'CUSTOM',
      subtitle: `${workSeconds}s/${restSeconds}s • ${exercisesPerSet} EX × ${totalSets} SETS`,
      workSeconds,
      restSeconds,
      prepSeconds,
      exercisesPerSet,
      setRestSeconds: setRestDuration,
      totalSets,
      totalRounds: exercisesPerSet * totalSets,
    };

    if (saveToHome && onSaveCustomPreset) {
      onSaveCustomPreset(customPreset);
    }
    onStartCustomWorkout(customPreset);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
      <div className="glass-modal rounded-3xl p-6 max-w-md w-full shadow-2xl my-auto">
        <div className="flex justify-between items-center mb-4 border-b border-[#353534] pb-3">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-sliders-h text-accent text-xl" />
            <h3 className="font-extrabold text-lg text-[#e5e2e1] uppercase tracking-tight">
              Personalizar Treino
            </h3>
          </div>
          <button onClick={onClose} className="text-[#c6c9ab] hover:text-white cursor-pointer">
            <i className="fi fi-rr-cross text-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">
              NOME DO TREINO
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-2 text-[#e5e2e1] focus:border-accent outline-none text-sm font-medium"
              required
            />
          </div>

          {/* WORK AND EXERCISE REST */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-accent h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                TRABALHO / EXER. (SEG)
              </label>
              <input
                type="number"
                value={workSeconds}
                onChange={(e) => setWorkSeconds(Math.max(5, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-accent font-black text-center text-lg focus:border-accent outline-none"
                min={5}
                max={600}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#ffb4aa] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                DESCANSO / EXER. (SEG)
              </label>
              <input
                type="number"
                value={restSeconds}
                onChange={(e) => setRestSeconds(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#ffb4aa] font-black text-center text-lg focus:border-[#ffb4aa] outline-none"
                min={0}
                max={600}
              />
            </div>
          </div>

          {/* EXERCISES PER SET & TOTAL SETS */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#e5e2e1] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                EXERCÍCIOS P/ SÉRIE
              </label>
              <input
                type="number"
                value={exercisesPerSet}
                onChange={(e) => setExercisesPerSet(Math.max(1, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#e5e2e1] font-black text-center text-lg focus:border-accent outline-none"
                min={1}
                max={30}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-accent h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                TOTAL DE SÉRIES
              </label>
              <input
                type="number"
                value={totalSets}
                onChange={(e) => setTotalSets(Math.max(1, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-accent font-black text-center text-lg focus:border-accent outline-none"
                min={1}
                max={20}
              />
            </div>
          </div>

          {/* SET REST & PREPARATION */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#ffb4aa] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                DESCANSO SÉRIES (SEG)
              </label>
              <input
                type="number"
                value={setRestDuration}
                onChange={(e) => setSetRestDuration(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#ffb4aa] font-black text-center text-lg focus:border-[#ffb4aa] outline-none"
                min={0}
                max={600}
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#adc6ff] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                PREPARAÇÃO (SEG)
              </label>
              <input
                type="number"
                value={prepSeconds}
                onChange={(e) => setPrepSeconds(Math.max(0, Number(e.target.value)))}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#adc6ff] font-black text-center text-lg focus:border-[#adc6ff] outline-none"
                min={0}
                max={60}
              />
            </div>
          </div>

          {/* ESTIMATED SUMMARY CARD */}
          <div className="bg-[#131313] border border-[#353534] rounded-xl p-3 flex justify-between items-center font-label-caps text-xs">
            <span className="text-[#c6c9ab]">TOTAL ESTIMADO</span>
            <span className="text-accent font-bold">
              {exercisesPerSet * totalSets} ROUNDS • ~
              {Math.ceil(
                (prepSeconds +
                  totalSets *
                    (exercisesPerSet * (workSeconds + restSeconds) + setRestDuration)) /
                  60
              )}{' '}
              MIN
            </span>
          </div>

          {/* SAVE TO HOME CHECKBOX */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-label-caps text-[#e5e2e1] bg-[#131313] p-3 rounded-xl border border-[#353534] hover:border-accent/40 transition-colors">
            <input
              type="checkbox"
              checked={saveToHome}
              onChange={(e) => setSaveToHome(e.target.checked)}
              className="accent-accent w-4 h-4 cursor-pointer rounded"
            />
            <span>Salvar treino como card na Home</span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-accent text-accent-dark rounded-2xl font-black font-label-caps text-xs tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_15px_var(--accent-glow)] cursor-pointer"
          >
            INICIAR TREINO AGORA
          </button>
        </form>
      </div>
    </div>
  );
};
