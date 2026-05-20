import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, register } from '../services/auth-api';

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {visible ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (password !== confirm) throw new Error('As senhas não coincidem.');
      await register({ name, email, password });
      await login({ email, password });
    },
    onSuccess: () => navigate('/onboarding', { replace: true }),
    onError: (err: Error) => {
      setError(err.message.includes('senhas') ? err.message : 'Não foi possível criar a conta. Verifique os dados e tente novamente.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col">
      <header className="flex items-center justify-between px-5 py-4">
        <span className="text-[#ccff00] font-black text-xl tracking-tight">G7_MonitoreSeuTreino</span>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#ccff00" />
        </svg>
      </header>

      <main className="flex-1 px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Alta Performance
        </p>
        <h1 className="text-5xl font-black uppercase tracking-tight leading-none text-white mb-2">
          ABASTEÇA SUA EVOLUÇÃO
        </h1>
        <div className="w-16 h-1 bg-[#ccff00] mb-8" />

        <form
          onSubmit={handleSubmit}
          className="bg-[#1a1530] rounded-2xl p-6 space-y-5 border border-[rgba(139,127,168,0.18)]"
        >
          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Nome</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-[#221d3d] border border-[rgba(139,127,168,0.25)] rounded-xl px-4 py-3 text-white placeholder-[#4a4266] outline-none focus:border-[#ccff00] transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">E-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@atleta.com"
              className="w-full bg-[#221d3d] border border-[rgba(139,127,168,0.25)] rounded-xl px-4 py-3 text-white placeholder-[#4a4266] outline-none focus:border-[#ccff00] transition text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Senha</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#221d3d] border border-[rgba(139,127,168,0.25)] rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4266] outline-none focus:border-[#ccff00] transition text-sm"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7fa8] hover:text-white transition">
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Confirmar senha</label>
            <div className="relative">
              <input
                required
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#221d3d] border border-[rgba(139,127,168,0.25)] rounded-xl px-4 py-3 pr-12 text-white placeholder-[#4a4266] outline-none focus:border-[#ccff00] transition text-sm"
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b7fa8] hover:text-white transition">
                <EyeIcon visible={showConfirm} />
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs leading-5">{error}</p>}

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-gradient-to-r from-[#ccff00] to-[#a8d400] text-[#0d0b1e] font-black text-sm uppercase tracking-[0.2em] py-4 rounded-xl transition hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-[rgba(139,127,168,0.2)]" />
          <span className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase">Conectar via</span>
          <div className="flex-1 h-px bg-[rgba(139,127,168,0.2)]" />
        </div>

        <button type="button" className="w-full flex items-center justify-center gap-3 bg-[#1a1530] border border-[rgba(139,127,168,0.18)] rounded-xl py-4 text-white font-bold text-sm uppercase tracking-[0.15em] hover:border-[rgba(139,127,168,0.4)] transition">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>

        <p className="mt-8 text-center text-[#8b7fa8] text-sm">
          Já possui uma conta?{' '}
          <Link to="/login" className="text-[#ccff00] font-black text-xs uppercase tracking-[0.15em] hover:brightness-110">
            Realize seu login aqui →
          </Link>
        </p>
      </main>
    </div>
  );
}
