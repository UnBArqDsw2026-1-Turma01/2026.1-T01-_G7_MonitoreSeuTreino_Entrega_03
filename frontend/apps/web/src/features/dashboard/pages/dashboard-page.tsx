import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getOnboardingStatus } from '../../onboarding/services/onboarding-api';
import { TRAINING_LEVEL_LABELS } from '../../onboarding/types/onboarding.types';
import { BottomNavigation } from '../../../shared/components/bottom-navigation';
import { AppHeader } from '../../../shared/components/app-header';
import { useAuthStore } from '../../auth/store/auth-store';
import { fetchRoutines } from '../../routines/services/routine-api';
import { getSessionHistory } from '../../session/services/session-api';

const getUserIdFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || payload.id;
  } catch (error) {
    console.error("Erro ao decodificar token", error);
    return null;
  }
};


export function DashboardPage() {
  const navigate = useNavigate();

  const statusQuery = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: getOnboardingStatus,
  });

  const { token } = useAuthStore();
  const userId = getUserIdFromToken(token);

  const routinesQuery = useQuery({
    queryKey: ['routines', userId],
    queryFn: () => fetchRoutines(userId!),
    enabled: !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['session-history', userId],
    queryFn: () => getSessionHistory(),
    enabled: !!userId,
  });

  useEffect(() => {
    if (statusQuery.data && !statusQuery.data.completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [statusQuery.data, navigate]);

  const profile = statusQuery.data?.profile ?? null;

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-20">
      <AppHeader title="G7_MonitoreSeuTreino" />

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
          {/* Card Treinos */}
          <Link
            to="/sessions/new"
            className="bg-[#1a1530] rounded-2xl p-4 border border-[rgba(139,127,168,0.15)] hover:border-brand/40 transition flex flex-col justify-between min-h-[110px]"
          >
            <div>
              <p className="text-[#8b7fa8] text-[10px] font-black uppercase tracking-wider">Gravar Treino</p>
              <p className="text-white font-black text-xl mt-2">Gravar</p>
            </div>
            <p className="text-[#4a4266] text-[10px] font-bold uppercase mt-1">Iniciar nova sessão</p>
          </Link>

          {/* Card Rotina */}
          <Link
            to="/routines"
            className="bg-[#1a1530] rounded-2xl p-4 border border-[rgba(139,127,168,0.15)] hover:border-brand/40 transition flex flex-col justify-between min-h-[110px]"
          >
            <div>
              <p className="text-[#8b7fa8] text-[10px] font-black uppercase tracking-wider">Sua Ficha</p>
              <p className="text-white font-black text-sm mt-2 truncate">
                {routinesQuery.isLoading ? '...' : (routinesQuery.data?.find(r => r.isActive)?.name || 'Nenhuma ativa')}
              </p>
            </div>
            <p className="text-[#4a4266] text-[10px] font-bold uppercase mt-1">Fichas de treino</p>
          </Link>

          {/* Card Histórico */}
          <Link
            to="/sessions/history"
            className="bg-[#1a1530] rounded-2xl p-4 border border-[rgba(139,127,168,0.15)] hover:border-brand/40 transition flex flex-col justify-between min-h-[110px]"
          >
            <div>
              <p className="text-[#8b7fa8] text-[10px] font-black uppercase tracking-wider">Histórico</p>
              <p className="text-white font-black text-xl mt-2">
                {historyQuery.isLoading ? '...' : (historyQuery.data?.sessions.length !== undefined ? `${historyQuery.data.sessions.length} treinos` : '0 treinos')}
              </p>
            </div>
            <p className="text-[#4a4266] text-[10px] font-bold uppercase mt-1">Sessões concluídas</p>
          </Link>

          {/* Card Exercícios */}
          <Link
            to="/exercises"
            className="bg-[#1a1530] rounded-2xl p-4 border border-[rgba(139,127,168,0.15)] hover:border-brand/40 transition flex flex-col justify-between min-h-[110px]"
          >
            <div>
              <p className="text-[#8b7fa8] text-[10px] font-black uppercase tracking-wider">Exercícios</p>
              <p className="text-white font-black text-xl mt-2">Catálogo</p>
            </div>
            <p className="text-[#4a4266] text-[10px] font-bold uppercase mt-1">Gerenciar lista</p>
          </Link>
        </div>
      </main>
      <BottomNavigation/>
    </div>
  );
}
