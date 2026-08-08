import React, { useState } from 'react';
import { WorkoutHistoryItem } from '../types';

interface AnalyticsScreenProps {
  historyItems: WorkoutHistoryItem[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ historyItems }) => {
  const [selectedBar, setSelectedBar] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const totalSessions = historyItems.length;
  const totalMinutes = historyItems.reduce((acc, item) => acc + (item.durationMinutes || 0), 0);
  const totalHoursStr = totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)}h` : `${totalMinutes}m`;
  const consistencyPercent = totalSessions > 0 ? Math.min(100, Math.round((totalSessions / 10) * 100)) : 0;

  // Breakdown by workout type
  const typeCounts = historyItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typesList = [
    { type: 'TABATA', name: 'Tabata', count: typeCounts['TABATA'] || 0 },
    { type: 'EMOM', name: 'EMOM', count: typeCounts['EMOM'] || 0 },
    { type: 'AMRAP', name: 'AMRAP', count: typeCounts['AMRAP'] || 0 },
    { type: 'CUSTOM', name: 'Custom', count: typeCounts['CUSTOM'] || 0 },
  ];

  const maxTypeCount = Math.max(...typesList.map((t) => t.count), 1);

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map dates with workouts in this month
  const workoutDaysSet = new Set<number>();
  historyItems.forEach((item) => {
    const itemDate = new Date(item.timestamp || Date.now());
    if (itemDate.getFullYear() === year && itemDate.getMonth() === month) {
      workoutDaysSet.add(itemDate.getDate());
    }
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const weekHeaders = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  return (
    <main className="px-6 pt-4 pb-28 max-w-[600px] mx-auto space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#353534]/60 pb-3">
        <div>
          <h2 className="font-black text-2xl text-[#e5e2e1] uppercase tracking-tight">
            Análise de Progresso
          </h2>
          <p className="font-label-caps text-xs text-[#c6c9ab] mt-0.5">
            Métricas ativas e histórico sincronizado
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 bg-[#131313] px-3.5 py-1.5 rounded-full border border-[#353534] shadow-sm">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
          </span>
          <span className="font-label-caps text-[10px] text-[#e5e2e1] tracking-wider uppercase font-bold shrink-0">
            DADOS EM TEMPO REAL
          </span>
        </div>
      </div>

      {/* DYNAMIC METRICS HIGHLIGHTS */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="glass-card rounded-2xl p-3 sm:p-4 text-center min-w-0 flex flex-col justify-center items-center">
          <span className="font-label-caps text-[9px] sm:text-[10px] text-[#c6c9ab] uppercase block mb-1 truncate w-full">
            Sessões
          </span>
          <span className="font-black text-xl sm:text-2xl text-accent truncate w-full">{totalSessions}</span>
        </div>
        <div className="glass-card rounded-2xl p-3 sm:p-4 text-center min-w-0 flex flex-col justify-center items-center">
          <span className="font-label-caps text-[9px] sm:text-[10px] text-[#c6c9ab] uppercase block mb-1 truncate w-full">
            Tempo Total
          </span>
          <span className="font-black text-xl sm:text-2xl text-[#e5e2e1] truncate w-full">{totalHoursStr}</span>
        </div>
        <div className="glass-card rounded-2xl p-3 sm:p-4 text-center min-w-0 flex flex-col justify-center items-center">
          <span className="font-label-caps text-[9px] sm:text-[10px] text-[#c6c9ab] uppercase block mb-1 truncate w-full">
            Consistência
          </span>
          <span className="font-black text-xl sm:text-2xl text-[#ffb4aa] truncate w-full">{consistencyPercent}%</span>
        </div>
      </div>

      {/* MONTHLY CALENDAR OF WORKOUTS */}
      <section className="glass-card rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-[#e5e2e1] uppercase tracking-wide">
              Calendário de Treinos
            </h3>
            <p className="font-label-caps text-xs text-[#c6c9ab]">
              {monthNames[month]} {year}
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-label-caps font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
              {workoutDaysSet.size} {workoutDaysSet.size === 1 ? 'Dia Ativo' : 'Dias Ativos'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-[#131313] border border-[#353534] text-[#c6c9ab] hover:text-white hover:border-accent transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <i className="fi fi-rr-angle-left text-xs" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-[#131313] border border-[#353534] text-[#c6c9ab] hover:text-white hover:border-accent transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <i className="fi fi-rr-angle-right text-xs" />
              </button>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2 font-label-caps text-[10px] font-bold text-[#c6c9ab]">
          {weekHeaders.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before the 1st day */}
          {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
            <div key={`empty_${idx}`} className="w-full aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const hasWorkout = workoutDaysSet.has(dayNum);
            const isToday =
              new Date().getDate() === dayNum &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day_${dayNum}`}
                className={`w-full aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all relative ${
                  hasWorkout
                    ? 'bg-accent text-accent-dark shadow-[0_0_10px_var(--accent-glow)] font-black scale-105'
                    : isToday
                    ? 'bg-[#131313] border-2 border-accent text-accent'
                    : 'bg-[#131313] border border-[#353534] text-[#e5e2e1]'
                }`}
              >
                <span>{dayNum}</span>
                {hasWorkout && (
                  <i className="fi fi-rr-check text-[9px] font-black -mt-0.5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-4 mt-4 pt-3 border-t border-[#2a2a2a] text-xs text-[#c6c9ab] font-label-caps">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-accent rounded-md shadow-[0_0_5px_var(--accent-glow)]" />
            <span>Treino Realizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#131313] border-2 border-accent rounded-md" />
            <span>Hoje</span>
          </div>
        </div>
      </section>

      {/* WORKOUT TYPES BREAKDOWN BAR CHART */}
      <section className="glass-card rounded-2xl p-5">
        <h3 className="font-label-caps text-xs text-[#c6c9ab] mb-2 uppercase tracking-widest">
          Distribuição de Treinos por Modalidade
        </h3>

        {totalSessions > 0 ? (
          <div className="flex items-end h-36 gap-3 mt-6">
            {typesList.map((item) => {
              const heightPct = Math.max(15, Math.round((item.count / maxTypeCount) * 100));
              return (
                <div
                  key={item.type}
                  onMouseEnter={() => setSelectedBar(item.type)}
                  onMouseLeave={() => setSelectedBar(null)}
                  className="flex-1 bg-accent rounded-t-lg relative group cursor-pointer transition-all hover:opacity-90 flex flex-col justify-end items-center"
                  style={{ height: `${heightPct}%` }}
                >
                  <div
                    className={`absolute -top-7 left-1/2 transform -translate-x-1/2 font-label-caps text-xs text-accent bg-[#131313] px-2 py-0.5 rounded border border-accent/40 transition-opacity whitespace-nowrap ${
                      selectedBar === item.type ? 'opacity-100 scale-110' : 'opacity-80'
                    }`}
                  >
                    {item.count} treinos
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs font-label-caps text-[#c6c9ab] border border-dashed border-[#353534] rounded-xl my-4">
            Realize seus primeiros treinos para visualizar o gráfico de modalidades
          </div>
        )}

        <div className="flex justify-between mt-3 font-label-caps text-[#c6c9ab] text-xs">
          {typesList.map((item) => (
            <span key={item.type} className="flex-1 text-center font-bold">
              {item.name}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
};
