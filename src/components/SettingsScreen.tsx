import React from 'react';
import { UserProfile, UserSettings } from '../types';
import { playBeep } from '../utils/sound';

interface SettingsScreenProps {
  user: UserProfile | null;
  settings: UserSettings;
  onUpdateSettings: (updated: Partial<UserSettings>) => void;
  onLogout: () => void;
  onClearHistory: () => void;
  onOpenLogin: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  settings,
  onUpdateSettings,
  onLogout,
  onClearHistory,
  onOpenLogin,
}) => {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [showClearedToast, setShowClearedToast] = React.useState(false);

  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [isInstalled, setIsInstalled] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('Para instalar: no seu navegador, clique nos 3 pontos ou no ícone de Compartilhar e selecione "Adicionar à Tela Inicial" / "Instalar Aplicativo".');
    }
  };

  return (
    <main className="px-4 sm:px-6 pt-4 pb-28 max-w-[600px] mx-auto space-y-6">
      {/* Title - Responsive flex layout preventing overlap */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2a2a2a] pb-3">
        <h2 className="font-black text-2xl sm:text-3xl text-[#e5e2e1] uppercase tracking-tight">
          Configurações
        </h2>
        <span className="self-start sm:self-auto font-label-caps text-xs text-accent bg-accent/10 border border-accent/30 px-3 py-1.5 rounded-full font-bold tracking-wider shrink-0">
          PULSE v2.5
        </span>
      </div>

      {/* PWA INSTALL CARD */}
      <section className="glass-card rounded-2xl p-5 space-y-3 shadow-lg border-2 border-accent/40 bg-accent/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fi fi-rr-download text-accent text-xl" />
            <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
              Aplicativo Web (PWA)
            </h3>
          </div>
          <span className="font-label-caps text-[10px] text-accent bg-accent/20 px-2 py-0.5 rounded-full font-bold">
            {isInstalled ? 'INSTALADO' : 'PRONTO PARA INSTALAR'}
          </span>
        </div>
        <p className="text-xs text-[#c6c9ab] leading-relaxed font-sans">
          Instale o **Pulse & Precision** diretamente na tela inicial do seu celular ou computador para acesso offline rápido e em tela cheia.
        </p>
        <button
          onClick={handleInstallClick}
          className="w-full py-3 bg-accent text-accent-dark font-black font-label-caps text-xs tracking-wider rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_var(--accent-glow)] cursor-pointer"
        >
          <i className="fi fi-rr-mobile-button text-base" />
          {isInstalled ? 'APLICATIVO JÁ INSTALADO' : 'INSTALAR APLICATIVO NO NAVEGADOR'}
        </button>
      </section>

      {/* ACCOUNT PROFILE SECTION */}
      <section className="glass-card rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
          Sua Conta Pulse
        </h3>

        {user && user.isLoggedIn ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-accent text-accent-dark font-black text-xl rounded-2xl flex items-center justify-center uppercase shadow-[0_0_12px_var(--accent-glow)] shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-base text-[#e5e2e1] truncate">{user.name}</p>
                <p className="font-label-caps text-xs text-[#c6c9ab] truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-[#c5020b]/20 border border-[#c5020b]/40 text-[#ffb4aa] hover:bg-[#c5020b]/30 font-label-caps text-xs font-bold rounded-xl transition-all shrink-0 self-start sm:self-auto cursor-pointer"
            >
              SAIR DA CONTA
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-[#e5e2e1]">Você não está conectado</p>
              <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5">
                Faça login para salvar seus dados
              </p>
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-2.5 bg-accent text-accent-dark font-label-caps text-xs font-black rounded-xl hover:opacity-90 transition-all shrink-0 self-start sm:self-auto cursor-pointer"
            >
              ENTRAR / REGISTRAR
            </button>
          </div>
        )}
      </section>

      {/* THEME, GLASSMORPHISM & ROLLBACK SECTION */}
      <section className="glass-card rounded-2xl p-5 space-y-5 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
            Efeitos Visuais e Tema
          </h3>
        </div>

        {/* GLASSMORPHISM TOGGLE */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#353534]/60">
          <div className="flex-1 min-w-0 pr-2">
            <p className="font-bold text-sm text-[#e5e2e1] flex items-center gap-2">
              <i className="fi fi-rr-expand text-accent text-base" />
              <span>Efeito Glassmorphism (Vidro Fosco)</span>
            </p>
            <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5 leading-snug">
              Aplica transparência elegante, desfoque de fundo e bordas translúcidas
            </p>
          </div>
          <button
            onClick={() => onUpdateSettings({ glassmorphismEnabled: settings.glassmorphismEnabled === false ? true : false })}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
              settings.glassmorphismEnabled !== false ? 'bg-accent' : 'bg-[#353534]'
            }`}
            aria-label="Ativar Efeito Glassmorphism"
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.glassmorphismEnabled !== false ? 'translate-x-6 bg-[#191e00]' : 'translate-x-0 bg-[#e5e2e1]'
              }`}
            />
          </button>
        </div>

        {/* LIGHT / DARK MODE SELECTOR */}
        <div className="py-2 space-y-2.5">
          <div>
            <p className="font-bold text-sm text-[#e5e2e1] flex items-center gap-2">
              <i className="fi fi-rr-palette text-accent text-base" />
              <span>Modo de Aparência</span>
            </p>
            <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5">
              Escolha a aparência da aplicação (Tema Escuro ou Tema Claro)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ themeMode: 'dark' })}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer font-label-caps text-xs font-bold ${
                settings.themeMode !== 'light'
                  ? 'bg-accent text-accent-dark border-accent shadow-[0_0_15px_var(--accent-glow)] scale-[1.02]'
                  : 'bg-[#131313]/60 text-[#c6c9ab] border-[#353534] hover:border-accent/40'
              }`}
            >
              <i className="fi fi-rr-moon text-base" />
              <span>TEMA ESCURO</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ themeMode: 'light' })}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer font-label-caps text-xs font-bold ${
                settings.themeMode === 'light'
                  ? 'bg-accent text-accent-dark border-accent shadow-[0_0_15px_var(--accent-glow)] scale-[1.02]'
                  : 'bg-[#131313]/60 text-[#c6c9ab] border-[#353534] hover:border-accent/40'
              }`}
            >
              <i className="fi fi-rr-sun text-base" />
              <span>TEMA CLARO</span>
            </button>
          </div>
        </div>
      </section>

      {/* AUDIO & BECOMING ALERTS */}
      <section className="glass-card rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
          Sinais Sonoros e Alertas
        </h3>

        {/* Sound toggle - sleek size & proper spacing */}
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[#353534]/60">
          <div className="flex-1 min-w-0 pr-2">
            <p className="font-bold text-sm text-[#e5e2e1]">Sinais Sonoros Ativos</p>
            <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5 leading-snug">
              Contagem regressiva e bip de troca de fase
            </p>
          </div>
          <button
            onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
              settings.soundEnabled ? 'bg-accent' : 'bg-[#353534]'
            }`}
            aria-label="Ativar Sinais Sonoros"
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.soundEnabled ? 'translate-x-6 bg-[#191e00]' : 'translate-x-0 bg-[#e5e2e1]'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-2 py-2 border-b border-[#353534]/60">
          <div className="flex justify-between items-center gap-2">
            <span className="font-bold text-sm text-[#e5e2e1]">Volume do Áudio</span>
            <span className="font-label-caps text-xs text-accent font-bold shrink-0">
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.volume}
            onChange={(e) => onUpdateSettings({ volume: parseFloat(e.target.value) })}
            className="w-full accent-accent bg-[#131313] h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Test audio - flexible layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#e5e2e1]">Testar Sinal Sonoro</p>
            <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5 leading-snug">
              Dispara o bip de alta frequência com o volume atual
            </p>
          </div>
          <button
            onClick={() => playBeep(1200, 300, 'triangle', settings.volume)}
            className="px-4 py-2.5 bg-accent/10 border border-accent/40 text-accent font-label-caps text-xs font-bold rounded-xl hover:bg-accent/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <i className="fi fi-rr-volume text-sm" />
            <span>TESTAR</span>
          </button>
        </div>
      </section>

      {/* WEEKLY GOAL SECTION */}
      <section className="glass-card rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
            Meta Semanal de Treinos
          </h3>
          <span className="font-label-caps text-xs text-accent font-black bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
            {settings.weeklyGoal || 5} { (settings.weeklyGoal || 5) === 1 ? 'SESSÃO' : 'SESSÕES' } / SEM
          </span>
        </div>

        <p className="text-xs text-[#c6c9ab] font-label-caps leading-relaxed">
          Defina quantas sessões de treino você planeja realizar por semana para acompanhar no painel principal.
        </p>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-1">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => {
            const isSelected = (settings.weeklyGoal || 5) === num;
            return (
              <button
                key={num}
                onClick={() => onUpdateSettings({ weeklyGoal: num })}
                className={`py-3 rounded-xl font-label-caps text-xs sm:text-sm font-black border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-accent text-accent-dark border-accent shadow-[0_0_12px_var(--accent-glow)] scale-105'
                    : 'bg-[#131313] text-[#c6c9ab] border-[#353534] hover:border-accent/50'
                }`}
              >
                {num}x
              </button>
            );
          })}
        </div>
      </section>

      {/* PREFERENCES DEFAULT TIMES - Clean 1-line text for cards */}
      <section className="glass-card rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="font-label-caps text-xs text-accent uppercase tracking-widest font-bold">
          Padrões do Cronômetro
        </h3>

        <div>
          <label className="font-bold text-sm text-[#e5e2e1] block mb-2">
            Tempo de Preparação Inicial
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[5, 10, 15].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateSettings({ defaultPrepSeconds: sec })}
                className={`py-2.5 px-2 rounded-xl font-label-caps text-xs font-bold border transition-all truncate text-center ${
                  settings.defaultPrepSeconds === sec
                    ? 'bg-accent text-accent-dark border-accent shadow-[0_0_10px_var(--accent-glow)]'
                    : 'bg-[#131313] text-[#c6c9ab] border-[#353534] hover:border-[#353534]/80'
                }`}
              >
                {sec} SEG
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-bold text-sm text-[#e5e2e1] block mb-2">
            Descanso Padrão entre Séries
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[30, 60, 90].map((sec) => (
              <button
                key={sec}
                onClick={() => onUpdateSettings({ defaultSetRestSeconds: sec })}
                className={`py-2.5 px-2 rounded-xl font-label-caps text-xs font-bold border transition-all truncate text-center ${
                  settings.defaultSetRestSeconds === sec
                    ? 'bg-accent text-accent-dark border-accent shadow-[0_0_10px_var(--accent-glow)]'
                    : 'bg-[#131313] text-[#c6c9ab] border-[#353534] hover:border-[#353534]/80'
                }`}
              >
                {sec} SEG
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DATA MANAGEMENT */}
      <section className="glass-card rounded-2xl p-5 space-y-4 shadow-lg">
        <h3 className="font-label-caps text-xs text-[#ffb4aa] uppercase tracking-widest font-bold">
          Gerenciamento de Dados Locais
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#e5e2e1]">Limpar Histórico de Treinos</p>
            <p className="text-xs text-[#c6c9ab] font-label-caps mt-0.5 leading-snug">
              Remove todas as sessões e reseta as estatísticas do perfil
            </p>
          </div>
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2.5 bg-[#c5020b]/20 border border-[#c5020b]/50 text-[#ffb4aa] font-label-caps text-xs font-bold rounded-xl hover:bg-[#c5020b]/40 active:scale-95 transition-all shrink-0 self-start sm:self-auto whitespace-nowrap cursor-pointer"
          >
            APAGAR HISTÓRICO
          </button>
        </div>
      </section>

      {/* CLEAR HISTORY CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="glass-modal border border-[#ffb4aa]/40 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 bg-[#c5020b]/20 border border-[#c5020b]/50 text-[#ffb4aa] rounded-2xl flex items-center justify-center mx-auto">
              <i className="fi fi-rr-trash text-2xl" />
            </div>
            <div>
              <h3 className="font-black text-xl text-[#e5e2e1] uppercase tracking-tight">
                Apagar Histórico?
              </h3>
              <p className="text-xs text-[#c6c9ab] font-label-caps mt-2 leading-relaxed">
                Tem certeza que deseja apagar todas as suas sessões gravadas? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 bg-[#131313] border border-[#353534] text-[#e5e2e1] rounded-xl font-label-caps text-xs font-bold hover:bg-[#2a2a2a] transition-colors cursor-pointer"
              >
                CANCELAR
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowConfirmModal(false);
                  setShowClearedToast(true);
                  setTimeout(() => setShowClearedToast(false), 3000);
                }}
                className="flex-1 py-3 bg-[#c5020b] text-white rounded-xl font-label-caps text-xs font-black hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(197,2,11,0.4)] cursor-pointer"
              >
                SIM, APAGAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {showClearedToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#201f1f] border border-accent text-accent px-4 py-2.5 rounded-xl font-label-caps text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <i className="fi fi-rr-check-circle text-sm" />
          Histórico apagado com sucesso!
        </div>
      )}
    </main>
  );
};

