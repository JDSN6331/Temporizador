import React, { useState } from 'react';
import { WorkoutHistoryItem, WorkoutPreset } from '../types';

interface HistoryScreenProps {
  historyItems: WorkoutHistoryItem[];
  onStartWorkout: (preset: WorkoutPreset) => void;
  onDeleteHistoryItem: (id: string) => void;
  onAddManualWorkout: (item: WorkoutHistoryItem) => void;
}

export const initialHistoryItems: WorkoutHistoryItem[] = [
  {
    id: '1',
    title: 'Tabata',
    dateStr: 'HOJE, 08:30',
    timestamp: Date.now() - 3600000,
    durationMinutes: 20,
    roundsCompleted: 8,
    totalRounds: 8,
    intensity: 'ALTA INTENSIDADE',
    type: 'TABATA',
    colorBorder: 'border-[#d2f000]',
    iconName: 'local_fire_department',
  },
  {
    id: '2',
    title: 'Recuperação Ativa',
    dateStr: 'ONTEM, 18:00',
    timestamp: Date.now() - 86400000,
    durationMinutes: 45,
    roundsCompleted: 1,
    totalRounds: 1,
    intensity: 'BAIXA INTENSIDADE',
    type: 'RECOVERY',
    colorBorder: 'border-[#0060cc]',
    iconName: 'water_drop',
  },
  {
    id: '3',
    title: 'Força e Potência',
    dateStr: '12 OUT, 07:00',
    timestamp: Date.now() - 172800000,
    durationMinutes: 60,
    roundsCompleted: 5,
    totalRounds: 5,
    intensity: 'MÁXIMA',
    type: 'STRENGTH',
    colorBorder: 'border-[#ffb4aa]',
    iconName: 'fitness_center',
  },
  {
    id: '4',
    title: 'HIIT',
    dateStr: '10 OUT, 19:30',
    timestamp: Date.now() - 259200000,
    durationMinutes: 30,
    roundsCompleted: 10,
    totalRounds: 10,
    intensity: 'ALTA INTENSIDADE',
    type: 'AMRAP',
    colorBorder: 'border-[#d2f000]',
    iconName: 'timer',
  },
];

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  historyItems,
  onStartWorkout,
  onDeleteHistoryItem,
  onAddManualWorkout,
}) => {
  const [selectedItem, setSelectedItem] = useState<WorkoutHistoryItem | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form states for manual log
  const [manualTitle, setManualTitle] = useState('Crossfit WOD');
  const [manualDuration, setManualDuration] = useState(30);
  const [manualRounds, setManualRounds] = useState(5);

  const filteredItems = historyItems.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  const handleCreateManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = `HOJE, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newLog: WorkoutHistoryItem = {
      id: `manual_${Date.now()}`,
      title: manualTitle,
      dateStr,
      timestamp: Date.now(),
      durationMinutes: manualDuration,
      roundsCompleted: manualRounds,
      totalRounds: manualRounds,
      type: 'CUSTOM',
      colorBorder: 'border-[#d2f000]',
      iconName: 'fitness_center',
    };

    onAddManualWorkout(newLog);
    setShowAddModal(false);
  };

  return (
    <main className="px-6 pt-4 pb-28 max-w-[600px] mx-auto">
      {/* TITLE & ADD MANUAL ENTRY */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-2xl text-[#e5e2e1] uppercase tracking-tight font-['Inter']">
          Meus Treinos
        </h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-accent text-accent-dark font-label-caps text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <i className="fi fi-rr-add text-sm" />
          LOG
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex flex-wrap gap-2 mb-4 font-label-caps text-xs">
        {['ALL', 'TABATA', 'EMOM', 'AMRAP', 'RECOVERY', 'STRENGTH'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 ${
              filterType === type
                ? 'bg-accent text-accent-dark font-bold shadow-[0_0_10px_var(--accent-glow)]'
                : 'bg-[#201f1f] text-[#c6c9ab] hover:bg-[#2a2a2a]'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* WORKOUT CARDS LIST */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={`glass-card rounded-2xl p-5 flex items-center justify-between border-l-4 ${item.colorBorder} border-y border-r border-[#353534]/50 cursor-pointer hover:border-accent/50 transition-all group active:scale-[0.99]`}
          >
            <div>
              <p className="font-label-caps text-xs text-[#c6c9ab] mb-1 uppercase tracking-wider">
                {item.dateStr}
              </p>
              <h3 className="font-bold text-xl text-[#e5e2e1] mb-2 group-hover:text-accent transition-colors">
                {item.title}
              </h3>
              <div className="flex space-x-2 font-label-caps text-[11px]">
                <span className="bg-accent/10 text-accent px-2.5 py-1 rounded-md font-bold">
                  {item.durationMinutes} MIN
                </span>
                <span className="bg-[#353534] text-[#e5e2e1] px-2.5 py-1 rounded-md">
                  {item.roundsCompleted || item.totalRounds || 1} ROUNDS
                </span>
              </div>
            </div>
            <div className="text-right pl-3">
              <i
                className={`fi fi-rr-flame text-3xl ${
                  item.colorBorder.includes('#d2f000') || item.colorBorder.includes('border-accent')
                    ? 'text-accent'
                    : item.colorBorder.includes('#0060cc')
                    ? 'text-[#0060cc]'
                    : 'text-[#ffb4aa]'
                }`}
              />
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-[#201f1f] rounded-2xl border border-[#353534] p-6">
            <i className="fi fi-rr-gym text-4xl text-[#c6c9ab] mb-2 block" />
            <p className="text-[#e5e2e1] font-bold">Nenhum treino registrado neste filtro.</p>
            <p className="text-xs text-[#c6c9ab] mt-1 font-label-caps">
              Inicie um novo treino no botão Quick Start.
            </p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-modal rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-label-caps text-xs text-accent uppercase">
                {selectedItem.dateStr}
              </span>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#c6c9ab] hover:text-white cursor-pointer"
              >
                <i className="fi fi-rr-cross text-base" />
              </button>
            </div>

            <h3 className="font-extrabold text-2xl text-[#e5e2e1] mb-6">{selectedItem.title}</h3>

            <div className="bg-[#131313] rounded-2xl p-4 grid grid-cols-2 gap-4 mb-6 text-left border border-[#353534]">
              <div>
                <span className="font-label-caps text-[10px] text-[#c6c9ab] uppercase block">
                  Duração
                </span>
                <span className="font-bold text-lg text-[#e5e2e1]">
                  {selectedItem.durationMinutes} minutos
                </span>
              </div>
              <div>
                <span className="font-label-caps text-[10px] text-[#c6c9ab] uppercase block">
                  Rounds
                </span>
                <span className="font-bold text-lg text-accent">
                  {selectedItem.roundsCompleted}/{selectedItem.totalRounds}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onDeleteHistoryItem(selectedItem.id);
                  setSelectedItem(null);
                }}
                className="flex-1 py-3 bg-[#c5020b]/20 text-[#ffb4aa] border border-[#c5020b]/40 rounded-xl font-label-caps text-xs hover:bg-[#c5020b]/40 cursor-pointer"
              >
                DELETAR
              </button>
              <button
                onClick={() => {
                  onStartWorkout({
                    id: selectedItem.id,
                    name: selectedItem.title,
                    type: selectedItem.type,
                    subtitle: `${selectedItem.durationMinutes} MIN`,
                    workSeconds: 45,
                    restSeconds: 15,
                    prepSeconds: 5,
                    totalRounds: selectedItem.totalRounds || 8,
                  });
                  setSelectedItem(null);
                }}
                className="flex-1 py-3 bg-accent text-accent-dark rounded-xl font-label-caps text-xs font-black hover:opacity-90 cursor-pointer"
              >
                REPETIR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MANUAL LOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <form
            onSubmit={handleCreateManualLog}
            className="glass-modal rounded-3xl p-6 max-w-sm w-full shadow-2xl text-left"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-[#e5e2e1]">Registrar Treino</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#c6c9ab] hover:text-white cursor-pointer"
              >
                <i className="fi fi-rr-cross text-base" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">
                  Nome do Treino
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-[#e5e2e1] focus:border-accent outline-none text-sm"
                  required
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">
                  Duração (Minutos)
                </label>
                <input
                  type="number"
                  value={manualDuration}
                  onChange={(e) => setManualDuration(Number(e.target.value))}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-[#e5e2e1] focus:border-accent outline-none text-sm"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">
                  Rounds Realizados
                </label>
                <input
                  type="number"
                  value={manualRounds}
                  onChange={(e) => setManualRounds(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-2.5 text-[#e5e2e1] focus:border-accent outline-none text-sm"
                  min={1}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-accent text-accent-dark rounded-xl font-black font-label-caps text-xs tracking-wider"
            >
              SALVAR NO HISTÓRICO
            </button>
          </form>
        </div>
      )}
    </main>
  );
};
