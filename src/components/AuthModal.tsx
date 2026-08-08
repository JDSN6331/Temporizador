import React, { useState } from 'react';
import { UserProfile } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  isMandatory?: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  isMandatory = false,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === 'signup' && !name)) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        const res = await api.register(name, email, password);
        onLoginSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onLoginSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      console.warn('Erro na autenticação:', err?.message);
      if (mode === 'login') {
        setErrorMsg(err?.message || 'Conta não encontrada. Clique no botão abaixo para criar sua conta.');
      } else {
        setErrorMsg(err?.message || 'Erro ao realizar cadastro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#131313]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="glass-modal rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-left my-auto border-2 border-accent/20">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-[#c6c9ab] hover:text-white p-1 cursor-pointer"
          >
            <i className="fi fi-rr-cross text-base" />
          </button>
        )}

        {/* LOGO AND TITLE */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-accent text-accent-dark rounded-2xl mx-auto mb-2 flex items-center justify-center font-black text-2xl shadow-[0_0_20px_var(--accent-glow)]">
            P&P
          </div>
          <p className="font-black text-accent text-xs tracking-widest uppercase mb-1 font-label-caps">
            PULSE & PRECISION
          </p>
          <h2 className="font-black text-2xl text-[#e5e2e1] uppercase tracking-tight">
            {mode === 'login' ? 'Entrar na Conta' : 'Criar Nova Conta'}
          </h2>
          <p className="font-label-caps text-xs text-[#c6c9ab] mt-1 tracking-wider">
            {mode === 'login'
              ? 'Acesse seu histórico real e estatísticas'
              : 'Cadastre-se para sincronizar seus treinos'}
          </p>
        </div>

        {/* MODE TOGGLE SWITCH */}
        <div className="flex bg-[#131313] p-1 rounded-xl mb-5 font-label-caps text-xs border border-[#353534]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'login' ? 'bg-accent text-accent-dark shadow-[0_0_10px_var(--accent-glow)]' : 'text-[#c6c9ab]'
            }`}
          >
            ENTRAR
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-bold transition-all cursor-pointer ${
              mode === 'signup' ? 'bg-accent text-accent-dark shadow-[0_0_10px_var(--accent-glow)]' : 'text-[#c6c9ab]'
            }`}
          >
            CADASTRAR
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 text-xs font-label-caps text-[#ffb4aa] bg-[#c5020b]/20 border border-[#c5020b]/40 p-3.5 rounded-xl text-center space-y-2">
            <p className="leading-relaxed font-sans">{errorMsg}</p>
            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg('');
                }}
                className="w-full py-2 bg-accent text-accent-dark font-black font-label-caps text-xs rounded-lg hover:opacity-90 transition-opacity cursor-pointer shadow-[0_0_10px_var(--accent-glow)] mt-1"
              >
                CRIAR ESTA CONTA AGORA →
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">
                SEU NOME COMPLETO
              </label>
              <input
                type="text"
                placeholder="Ex: Carlos Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#e5e2e1] focus:border-accent outline-none"
              />
            </div>
          )}

          <div>
            <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">E-MAIL</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#e5e2e1] focus:border-accent outline-none"
              required
            />
          </div>

          <div>
            <label className="font-label-caps text-xs text-[#c6c9ab] block mb-1">SENHA</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#131313] border border-[#353534] rounded-xl px-4 py-3 text-sm text-[#e5e2e1] focus:border-accent outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-accent text-accent-dark font-black font-label-caps text-xs tracking-wider rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_var(--accent-glow)] mt-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fi fi-rr-spinner animate-spin text-sm" />
                CARREGANDO...
              </span>
            ) : mode === 'login' ? (
              'ENTRAR NA CONTA'
            ) : (
              'CRIAR MINHA CONTA'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
