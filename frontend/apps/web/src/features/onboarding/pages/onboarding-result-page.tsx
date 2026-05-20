import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../auth/services/auth-api';
import { getOnboardingStatus } from '../services/onboarding-api';
import {
  CONSISTENCY_OPTIONS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  TECHNIQUE_OPTIONS,
  TRAINING_LEVEL_LABELS,
  type OnboardingProfile,
  type OnboardingRouteState,
} from '../types/onboarding.types';

function findLabel(options: Array<{ value: string; label: string }>, value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function getLevelMessage(profile: OnboardingProfile) {
  if (profile.classification === 'BEGINNER') {
    return 'Seu perfil sugere foco em adaptação, domínio técnico e criação de consistência antes de aumentar complexidade.';
  }
  if (profile.classification === 'INTERMEDIATE') {
    return 'Você já tem base para progredir com mais estrutura, variando estímulos sem perder controle de execução.';
  }
  return 'Seu perfil indica repertório sólido para trabalhar progressão com mais intensidade e refinamento técnico.';
}

export function OnboardingResultPage() {
  const location = useLocation();
  const routeState = location.state as OnboardingRouteState | null;

  const statusQuery = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
    enabled: !routeState?.profile,
  });

  const profile = routeState?.profile ?? statusQuery.data?.profile ?? null;

  const levelColors: Record<string, string> = {
    BEGINNER: '#8b7fa8',
    INTERMEDIATE: '#ccff00',
    ADVANCED: '#ccff00',
  };
  const barColor = profile ? (levelColors[profile.classification] ?? '#ccff00') : '#8b7fa8';

  if (statusQuery.isLoading && !routeState?.profile) {
    return (
      <div className="min-h-screen bg-[#0d0b1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0d0b1e] flex flex-col items-center justify-center px-6">
        <p className="text-[#ccff00] text-xs font-bold tracking-[0.3em] uppercase mb-2">Sem dados</p>
        <h1 className="text-3xl font-black uppercase text-white mb-4">Nenhum resultado encontrado</h1>
        <p className="text-[#8b7fa8] text-sm mb-8">Complete o formulário de onboarding para gerar sua classificação.</p>
        <Link
          to="/onboarding"
          className="bg-gradient-to-r from-[#ccff00] to-[#a8d400] text-[#0d0b1e] font-black text-sm uppercase tracking-[0.2em] px-8 py-4 rounded-2xl hover:brightness-110 transition"
        >
          Fazer onboarding
        </Link>
      </div>
    );
  }

  const scorePercent = Math.max(8, Math.min(100, (profile.score / 10) * 100));

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col">
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
          <p className="text-[#ccff00] text-xs font-bold tracking-[0.3em] uppercase mb-2">Resultado</p>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-white mb-1">
            {TRAINING_LEVEL_LABELS[profile.classification]}
          </h1>
          <div className="w-12 h-1 bg-[#ccff00] mb-4" />
          <p className="text-[#8b7fa8] text-sm leading-6">{getLevelMessage(profile)}</p>
        </div>

        <div className="bg-[#1a1530] rounded-2xl p-6 border border-[rgba(139,127,168,0.15)]">
          <p className="text-[#8b7fa8] text-xs font-bold tracking-[0.2em] uppercase mb-4">Score calculado</p>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-[#ccff00] font-black text-5xl">{profile.score}</span>
            <span className="text-[#8b7fa8] text-lg pb-1">/10</span>
          </div>
          <div className="h-3 bg-[#221d3d] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${scorePercent}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">Iniciante</span>
            <span className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">Intermediário</span>
            <span className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">Avançado</span>
          </div>
        </div>

        <div className="bg-[#1a1530] rounded-2xl p-6 border border-[rgba(139,127,168,0.15)]">
          <p className="text-[#ccff00] text-xs font-bold tracking-[0.25em] uppercase mb-4">Respostas enviadas</p>
          <dl className="grid grid-cols-2 gap-3">
            {([
              ['Sexo', findLabel(SEX_OPTIONS, profile.sex)],
              ['Idade', `${profile.age} anos`],
              ['Experiência', `${profile.experienceMonths} meses`],
              ['Frequência', `${profile.weeklyFrequency}x/semana`],
              ['Objetivo', findLabel(GOAL_OPTIONS, profile.mainGoal)],
              ['Nível técnico', findLabel(TECHNIQUE_OPTIONS, profile.techniqueLevel)],
              ['Consistência', findLabel(CONSISTENCY_OPTIONS, profile.recentConsistency)],
              ['Planilha', profile.followedStructuredPlan ? 'Sim' : 'Não'],
              ['Progressão', profile.usesProgressiveLoad ? 'Sim' : 'Não'],
              ['Limitação', profile.hasLimitation ? 'Sim' : 'Não'],
            ] as [string, string][]).map(([label, value]) => (
              <div key={label} className="bg-[#221d3d] rounded-xl p-3">
                <dt className="text-[#8b7fa8] text-xs font-bold uppercase tracking-widest">{label}</dt>
                <dd className="text-white text-sm font-bold mt-1">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {profile.hasLimitation && (
          <div className="bg-[#221d3d] border border-[rgba(204,255,0,0.2)] rounded-2xl p-4">
            <p className="text-[#ccff00] text-xs font-bold uppercase tracking-widest mb-1">Atenção</p>
            <p className="text-[#8b7fa8] text-sm leading-5">
              Você declarou limitação física. Considere orientação profissional antes de aumentar intensidade.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            to="/onboarding"
            className="flex-1 text-center border border-[rgba(139,127,168,0.3)] text-[#8b7fa8] font-black text-sm uppercase tracking-[0.15em] py-4 rounded-2xl hover:border-[#ccff00] hover:text-white transition"
          >
            Ajustar respostas
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-gradient-to-r from-[#ccff00] to-[#a8d400] text-[#0d0b1e] font-black text-sm uppercase tracking-[0.15em] py-4 rounded-2xl hover:brightness-110 transition"
          >
            Ir ao início
          </Link>
        </div>
      </main>
    </div>
  );
}
