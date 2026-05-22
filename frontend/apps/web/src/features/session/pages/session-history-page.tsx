import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../auth/store/auth-store';
import { fetchRoutines } from '../../routines/services/routine-api';
import { searchExercises } from '../../exercises/services/exercises-api';
import type { Exercise } from '../../exercises/types/exercises.types';
import { getSessionHistory, getSessionHistoryDetail } from '../services/session-api';
import { AppHeader } from '../../../shared/components/app-header';
import { BottomNavigation } from '../../../shared/components/bottom-navigation';

const getUserIdFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload.userId || payload.id;
  } catch (error) {
    console.error('Erro ao decodificar token', error);
    return null;
  }
};

// Sub-componente para carregar e renderizar os detalhes de uma sessão
function SessionDetailCard({ sessionId, exercisesCatalog }: { sessionId: string; exercisesCatalog: Exercise[] }) {
  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => getSessionHistoryDetail(sessionId),
  });

  const getExerciseName = (exerciseId: string) => {
    const ex = exercisesCatalog.find((e) => e.id === exerciseId);
    return ex ? ex.name : 'Exercício';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <p className="text-xs text-red-400 py-3 text-center font-bold">
        Não foi possível carregar os detalhes deste treino.
      </p>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-4 animate-in slide-in-from-top-2 duration-200">
      {/* Resumo de Volume */}
      <div className="flex justify-between items-center bg-card px-4 py-3 rounded-xl border border-border">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted">Volume Total de Carga</span>
        <span className="text-base font-black text-brand font-mono">{detail.totalVolume} kg</span>
      </div>

      {/* Lista de Exercícios Executados */}
      <div className="space-y-3">
        {detail.exercises.length === 0 ? (
          <p className="text-xs text-muted py-1">Nenhum exercício registrado.</p>
        ) : (
          detail.exercises.map((ex) => (
            <div key={ex.id} className="bg-[#1a1530] border border-border/80 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-black uppercase text-white">{getExerciseName(ex.exerciseId)}</h4>
                <span className="text-[8px] font-black text-muted uppercase tracking-widest">
                  {ex.sets.length} séries executadas
                </span>
              </div>

              {/* Tabela Simplificada de Séries */}
              <div className="space-y-1.5 pt-1">
                {ex.sets.map((set, idx) => (
                  <div
                    key={set.id}
                    className="flex justify-between items-center text-[10px] bg-card/50 px-3 py-2 rounded-lg border border-border/40"
                  >
                    {/* Número da Série e Carga */}
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-brand font-black">{idx + 1}ª</span>
                      <span className="text-white font-bold">{set.weight ?? 0} kg</span>
                    </div>

                    {/* Repetições */}
                    <div className="flex items-center gap-2">
                      <span className="text-muted text-[8px] uppercase font-bold">Reps:</span>
                      <span className="text-white font-black font-mono">
                        {set.actualReps !== null ? set.actualReps : '—'} / {set.targetReps}
                      </span>
                    </div>

                    {/* Observação (se houver) */}
                    {set.observations ? (
                      <span className="text-[#00e5ff] italic truncate max-w-[140px] text-[9px]" title={set.observations}>
                        {set.observations}
                      </span>
                    ) : (
                      <span className="text-muted/40 text-[9px]">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SessionHistoryPage() {
  const { token } = useAuthStore();
  const userId = getUserIdFromToken(token);

  // Estados locais
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Queries
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['session-history', userId],
    queryFn: getSessionHistory,
    enabled: !!userId,
  });

  const { data: routines = [] } = useQuery({
    queryKey: ['routines', userId],
    queryFn: () => fetchRoutines(userId!),
    enabled: !!userId,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => searchExercises(),
    enabled: !!userId,
  });

  const toggleExpand = (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null);
    } else {
      setExpandedSessionId(sessionId);
    }
  };

  const getRoutineName = (routineId: string | null) => {
    if (!routineId) return 'Treino Avulso';
    const routine = routines.find((r) => r.id === routineId);
    return routine ? routine.name : 'Rotina Excluída';
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (!userId) {
    return <p className="text-center mt-10 text-muted">Você não está autenticado. Por favor, faça login.</p>;
  }

  const sessions = historyData?.sessions ?? [];

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-24 text-white">
      <AppHeader title="Histórico de Treinos" />

      <main className="flex-1 px-5 py-6 max-w-xl mx-auto w-full space-y-6">
        <div>
          <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-2">Suas execuções</p>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-white mb-1">HISTÓRICO</h1>
          <div className="w-12 h-1 bg-brand mb-1" />
        </div>

        {isLoadingHistory ? (
          <div className="flex justify-center py-12">
            <div className="w-7 h-7 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl bg-surface/50">
            <p className="text-muted text-sm font-bold uppercase tracking-wider mb-1">Nenhum treino gravado ainda</p>
            <p className="text-muted/60 text-xs">Comece a gravar seus treinos no botão central abaixo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isExpanded = expandedSessionId === session.sessionId;
              return (
                <div
                  key={session.sessionId}
                  onClick={() => toggleExpand(session.sessionId)}
                  className="bg-surface hover:bg-surface/90 border border-border hover:border-brand/35 rounded-2xl p-5 relative overflow-hidden cursor-pointer transition-all group"
                >
                  {/* Linha Lateral Neon */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 ${
                      isExpanded ? 'bg-brand' : 'bg-transparent group-hover:bg-brand/40'
                    }`}
                  />

                  {/* Informações Resumidas */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-brand text-[10px] font-black uppercase tracking-wider">
                        {getRoutineName(session.routineId)}
                      </p>
                      <h3 className="text-sm font-black text-white leading-tight">
                        {formatDate(session.date)}
                      </h3>
                      <p className="text-[9px] font-bold text-muted uppercase tracking-widest pt-1">
                        ↗ {session.exerciseCount} EXERCÍCIOS
                      </p>
                    </div>

                    {/* Chevron Icon */}
                    <div className="p-1">
                      <svg
                        className={`w-4 h-4 text-muted transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-brand' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Seção Expandida */}
                  {isExpanded && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <SessionDetailCard
                        sessionId={session.sessionId}
                        exercisesCatalog={exercises}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
}
