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
  const [workSeconds, setWorkSeconds] = useState<number | ''>(20);
  const [restSeconds, setRestSeconds] = useState<number | ''>(10);
  const [prepSeconds, setPrepSeconds] = useState<number | ''>(10);
  const [exercisesPerSet, setExercisesPerSet] = useState<number | ''>(8);
  const [setRestDuration, setSetRestDuration] = useState<number | ''>(60);
  const [totalSets, setTotalSets] = useState<number | ''>(4);
  const [saveToHome, setSaveToHome] = useState(true);

  const parsedWork = Number(workSeconds) || 20;
  const parsedRest = Number(restSeconds) || 0;
  const parsedPrep = Number(prepSeconds) || 5;
  const parsedExPerSet = Number(exercisesPerSet) || 8;
  const parsedSetRest = Number(setRestDuration) || 60;
  const parsedTotalSets = Number(totalSets) || 4;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customPreset: WorkoutPreset = {
      id: `custom_${Date.now()}`,
      name: name.trim() || 'Treino Personalizado',
      type: 'CUSTOM',
      subtitle: `${parsedWork}s/${parsedRest}s • ${parsedExPerSet} EX × ${parsedTotalSets} SETS`,
      workSeconds: parsedWork,
      restSeconds: parsedRest,
      prepSeconds: parsedPrep,
      exercisesPerSet: parsedExPerSet,
      setRestSeconds: parsedSetRest,
      totalSets: parsedTotalSets,
      totalRounds: parsedExPerSet * parsedTotalSets,
    };

    if (saveToHome && onSaveCustomPreset) {
      onSaveCustomPreset(customPreset);
    }
    onStartCustomWorkout(customPreset);
  };

  const handleNumChange = (
    setter: React.Dispatch<React.SetStateAction<number | ''>>,
    value: string
  ) => {
    // Strip non-digit characters so user can type and backspace freely
    const cleaned = value.replace(/[^0-9]/g, '');
    if (cleaned === '') {
      setter('');
    } else {
      const num = parseInt(cleaned, 10);
      setter(isNaN(num) ? '' : num);
    }
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={workSeconds}
                onChange={(e) => handleNumChange(setWorkSeconds, e.target.value)}
                onBlur={() => {
                  if (workSeconds === '' || workSeconds < 1) setWorkSeconds(20);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-accent font-black text-center text-lg focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#ffb4aa] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                DESCANSO / EXER. (SEG)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={restSeconds}
                onChange={(e) => handleNumChange(setRestSeconds, e.target.value)}
                onBlur={() => {
                  if (restSeconds === '') setRestSeconds(0);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#ffb4aa] font-black text-center text-lg focus:border-[#ffb4aa] outline-none"
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={exercisesPerSet}
                onChange={(e) => handleNumChange(setExercisesPerSet, e.target.value)}
                onBlur={() => {
                  if (exercisesPerSet === '' || exercisesPerSet < 1) setExercisesPerSet(8);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#e5e2e1] font-black text-center text-lg focus:border-accent outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-accent h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                TOTAL DE SÉRIES
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={totalSets}
                onChange={(e) => handleNumChange(setTotalSets, e.target.value)}
                onBlur={() => {
                  if (totalSets === '' || totalSets < 1) setTotalSets(4);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-accent font-black text-center text-lg focus:border-accent outline-none"
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={setRestDuration}
                onChange={(e) => handleNumChange(setSetRestDuration, e.target.value)}
                onBlur={() => {
                  if (setRestDuration === '') setSetRestDuration(60);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#ffb4aa] font-black text-center text-lg focus:border-[#ffb4aa] outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label className="font-label-caps text-[10px] sm:text-[11px] text-[#adc6ff] h-7 flex items-end justify-center text-center leading-tight mb-1.5 font-bold">
                PREPARAÇÃO (SEG)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={prepSeconds}
                onChange={(e) => handleNumChange(setPrepSeconds, e.target.value)}
                onBlur={() => {
                  if (prepSeconds === '') setPrepSeconds(5);
                }}
                className="w-full h-11 bg-[#131313] border border-[#353534] rounded-xl px-3 text-[#adc6ff] font-black text-center text-lg focus:border-[#adc6ff] outline-none"
              />
            </div>
          </div>

          {/* ESTIMATED SUMMARY CARD */}
          <div className="bg-[#131313] border border-[#353534] rounded-xl p-3 flex justify-between items-center font-label-caps text-xs">
            <span className="text-[#c6c9ab]">TOTAL ESTIMADO</span>
            <span className="text-accent font-bold">
              {parsedExPerSet * parsedTotalSets} ROUNDS • ~
              {Math.ceil(
                (parsedPrep +
                  parsedTotalSets *
                    (parsedExPerSet * (parsedWork + parsedRest) + parsedSetRest)) /
                  60
              )}{' '}
              MIN
            </span>
          </div>

          {/* SAVE TO HOME CHECKBOX */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="saveToHome"
              checked={saveToHome}
              onChange={(e) => setSaveToHome(e.target.checked)}
              className="accent-[#d2f000] w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="saveToHome" className="text-xs text-[#e5e2e1] font-medium cursor-pointer">
              Salvar como cartão de acesso rápido na Home
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="w-full py-3.5 bg-accent text-accent-dark font-black font-label-caps text-xs tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_var(--accent-glow)] mt-2 cursor-pointer"
          >
            INICIAR TREINO PERSONALIZADO →
          </button>
        </form>
      </div>
    </div>
  );
};
