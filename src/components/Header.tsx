import React from 'react';
import { UserProfile } from '../types';

interface HeaderProps {
  title?: string;
  user: UserProfile | null;
  onOpenMenu: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'PULSE & PRECISION',
  user,
  onOpenMenu,
  onOpenProfile,
  onOpenLogin,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="glass-header flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 border-b border-[#2a2a2a]">
      <button
        onClick={onOpenMenu}
        aria-label="Abrir Menu"
        className="text-accent font-label-caps hover:opacity-80 transition-transform active:scale-95 flex items-center justify-center p-2 rounded-lg hover:bg-[#201f1f]"
      >
        <i className="fi fi-rr-menu-burger text-xl" />
      </button>

      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-accent text-accent-dark rounded-xl flex items-center justify-center font-black text-xs shadow-[0_0_10px_var(--accent-glow)] shrink-0">
          P&P
        </div>
        <h1 className="font-extrabold text-lg md:text-xl tracking-tighter text-accent uppercase text-center font-['Inter']">
          {title}
        </h1>
      </div>

      {user?.isLoggedIn ? (
        <button
          onClick={onOpenProfile}
          aria-label="Perfil do Usuário"
          className="w-10 h-10 bg-accent text-accent-dark rounded-full flex items-center justify-center text-xs font-black overflow-hidden hover:scale-105 active:scale-95 transition-transform shadow-[0_0_12px_var(--accent-glow)] border-2 border-accent cursor-pointer shrink-0"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            getInitials(user.name)
          )}
        </button>
      ) : (
        <button
          onClick={onOpenLogin}
          aria-label="Fazer Login"
          className="bg-accent text-accent-dark font-black font-label-caps text-xs h-9 px-3.5 rounded-full flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-[0_0_12px_var(--accent-glow)]"
        >
          <i className="fi fi-rr-sign-in-alt text-sm" />
          <span>ENTRAR</span>
        </button>
      )}
    </header>
  );
};
