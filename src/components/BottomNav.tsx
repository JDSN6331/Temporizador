import React from 'react';

export type NavTab = 'home' | 'history' | 'analytics' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: NavTab; label: string; flaticon: string }[] = [
    { id: 'home', label: 'Home', flaticon: 'fi fi-rr-home' },
    { id: 'history', label: 'History', flaticon: 'fi fi-rr-time-past' },
    { id: 'analytics', label: 'Analytics', flaticon: 'fi fi-rr-stats' },
    { id: 'settings', label: 'Settings', flaticon: 'fi fi-rr-settings' },
  ];

  return (
    <nav className="glass-nav font-label-caps text-xs fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-50 flex justify-around items-center px-3 pb-4 pt-2 rounded-t-2xl shadow-[0_-4px_25px_rgba(0,0,0,0.9)] border-t border-[#201f1f]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? 'text-accent bg-accent/15 border border-accent/30 font-bold shadow-[0_0_12px_var(--accent-glow-subtle)]'
                : 'text-[#c6c9ab] opacity-70 hover:opacity-100 hover:text-[#e5e2e1]'
            }`}
          >
            <i className={`${tab.flaticon} text-lg mb-0.5`} />
            <span className="text-[10px] tracking-wider uppercase">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
