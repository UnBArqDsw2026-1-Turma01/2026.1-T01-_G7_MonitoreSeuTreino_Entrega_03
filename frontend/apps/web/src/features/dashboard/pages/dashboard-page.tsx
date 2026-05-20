import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../auth/services/auth-api';
import { getOnboardingStatus } from '../../onboarding/services/onboarding-api';
import { TRAINING_LEVEL_LABELS } from '../../onboarding/types/onboarding.types';

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={['flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]', active ? 'text-[#ccff00]' : 'text-[#8b7fa8]'].join(' ')}>
      {icon}
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();

  const statusQuery = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
  });

  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [statusQuery.data, navigate]);

  const profile = statusQuery.data?.profile ?? null;

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-20">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
        <span className="text-[#ccff00] font-black text-xl tracking-tight">G7_MonitoreSeuTreino</span>
        <div className="flex items-center gap-4">
          <button onClick={logout} className="text-[#8b7fa8] text-xs font-bold tracking-widest uppercase hover:text-white transition">
            Sair
          </button>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#ccff00" />
          </svg>
        </div>
      </header>

      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full space-y-6">
        <div>
          <p className="text-[#ccff00] text-xs font-bold tracking-[0.3em] uppercase mb-2">Bem-vindo</p>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-white mb-1">INÍCIO</h1>
          <div className="w-12 h-1 bg-[#ccff00] mb-1" />
        </div>

        {statusQuery.isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profile ? (
          <div className="bg-[#1a1530] rounded-2xl p-6 border border-[rgba(139,127,168,0.15)] space-y-4">
            <p className="text-[#ccff00] text-xs font-bold tracking-[0.25em] uppercase">Seu perfil de treino</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black text-2xl uppercase">{TRAINING_LEVEL_LABELS[profile.classification]}</p>
                <p className="text-[#8b7fa8] text-xs mt-1">Score {profile.score}/10</p>
              </div>
              <div className="text-right">
                <p className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">Frequência</p>
                <p className="text-white font-black text-xl">{profile.weeklyFrequency}x/sem</p>
              </div>
            </div>
            <div className="h-2 bg-[#221d3d] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[#ccff00]"
                style={{ width: `${Math.max(8, (profile.score / 10) * 100)}%` }}
              />
            </div>
            <Link
              to="/onboarding"
              className="block text-center border border-[rgba(204,255,0,0.3)] text-[#ccff00] font-black text-xs uppercase tracking-[0.2em] py-3 rounded-2xl hover:bg-[#ccff00]/10 transition"
            >
              Refazer onboarding
            </Link>
          </div>
        ) : (
          <div className="bg-[#1a1530] rounded-2xl p-6 border border-[rgba(139,127,168,0.15)] text-center space-y-4">
            <p className="text-[#8b7fa8] text-sm leading-5">Você ainda não completou o onboarding. Responda o formulário para descobrir seu nível de treino.</p>
            <Link
              to="/onboarding"
              className="inline-block bg-gradient-to-r from-[#ccff00] to-[#a8d400] text-[#0d0b1e] font-black text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:brightness-110 transition"
            >
              Fazer onboarding
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {([
            { label: 'Treinos', value: '—', sub: 'em breve' },
            { label: 'Rotina', value: '—', sub: 'em breve' },
            { label: 'Histórico', value: '—', sub: 'em breve' },
            { label: 'Progresso', value: '—', sub: 'em breve' },
          ]).map(({ label, value, sub }) => (
            <div key={label} className="bg-[#1a1530] rounded-2xl p-4 border border-[rgba(139,127,168,0.15)]">
              <p className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">{label}</p>
              <p className="text-white font-black text-2xl mt-1">{value}</p>
              <p className="text-[#4a4266] text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1530] border-t border-[rgba(139,127,168,0.15)] flex items-center justify-around px-2">
        <NavItem
          active
          label="Início"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
              <path d="M9 21V12h6v9" />
            </svg>
          }
        />
        <NavItem
          label="Treino"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" strokeLinecap="round" />
              <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          }
        />
        <div className="flex flex-col items-center gap-1 py-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#a8d400] flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.35)] -mt-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#0d0b1e" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#ccff00]">Gravar</span>
        </div>
        <Link to="/routines">
          <NavItem
            label="Rotina"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
            }
          />
        </Link>
        <NavItem
          label="Histórico"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </nav>
    </div>
  );
}
