import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/auth-store';
import { fetchRoutines } from '../../routines/services/routine-api';
import type { Routine } from '../../routines/services/routine-api';
import { searchExercises } from '../../exercises/services/exercises-api';
import type { Exercise } from '../../exercises/types/exercises.types';
import { getSessionHistoryDetail, updateSession } from '../services/session-api';
import { AppHeader } from '../../../shared/components/app-header';
import { BottomNavigation } from '../../../shared/components/bottom-navigation';
import type { RegisterSessionPayload, SessionHistoryDetail } from '../types/session.types';

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

const formatIsoToDatetimeLocal = (isoString: string) => {
  try {
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISOTime;
  } catch {
    return '';
  }
};

interface LocalActiveExercise {
  exerciseId: string;
  expectedSets: number;
  sets: {
    targetReps: number;
    actualReps: number | null;
    weight: number | null;
    observations: string;
  }[];
}

interface EditSessionFormProps {
  detail: SessionHistoryDetail;
  routines: Routine[];
  exercises: Exercise[];
  sessionId: string;
}

function EditSessionForm({ detail, routines, exercises, sessionId }: EditSessionFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Estados locais inicializados diretamente
  const [sessionDate, setSessionDate] = useState(() => formatIsoToDatetimeLocal(detail.date));
  const selectedRoutineId = detail.routineId || '';
  const [sessionExercises, setSessionExercises] = useState<LocalActiveExercise[]>(() =>
    detail.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      expectedSets: ex.expectedSets,
      sets: ex.sets.map((set) => ({
        targetReps: set.targetReps,
        actualReps: set.actualReps,
        weight: set.weight,
        observations: set.observations || '',
      })),
    }))
  );
  const [selectedExerciseToAdd, setSelectedExerciseToAdd] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Encontra a rotina associada (se houver)
  const activeRoutine = routines.find((r) => r.id === selectedRoutineId);

  // Mutação para salvar a edição
  const updateSessionMut = useMutation({
    mutationFn: (payload: RegisterSessionPayload) => updateSession(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-history'] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', sessionId] });
      setMessage({ text: 'Treino atualizado com sucesso! Redirecionando...', isError: false });
      setTimeout(() => {
        navigate('/sessions/history');
      }, 2000);
    },
    onError: (err) => {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMsg = axiosError.response?.data?.message || 'Erro ao atualizar treino. Verifique os dados.';
      setMessage({ text: errorMsg, isError: true });
    },
  });

  const handleAddExercise = () => {
    if (!selectedExerciseToAdd) return;
    
    // Evita duplicar exercício
    if (sessionExercises.some((se) => se.exerciseId === selectedExerciseToAdd)) {
      setMessage({ text: 'Este exercício já foi adicionado.', isError: true });
      return;
    }

    const newExercise: LocalActiveExercise = {
      exerciseId: selectedExerciseToAdd,
      expectedSets: 3,
      sets: Array.from({ length: 3 }, () => ({
        targetReps: 10,
        actualReps: 10,
        weight: 0,
        observations: '',
      })),
    };

    setSessionExercises([...sessionExercises, newExercise]);
    setSelectedExerciseToAdd('');
    setMessage(null);
  };

  const handleRemoveExercise = (idx: number) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== idx));
  };

  const handleAddSet = (exerciseIdx: number) => {
    const updated = [...sessionExercises];
    const targetEx = updated[exerciseIdx];
    
    const lastSetReps = targetEx.sets.length > 0 
      ? targetEx.sets[targetEx.sets.length - 1].targetReps 
      : 10;
    
    const lastSetWeight = targetEx.sets.length > 0 
      ? targetEx.sets[targetEx.sets.length - 1].weight 
      : 0;

    targetEx.sets.push({
      targetReps: lastSetReps,
      actualReps: lastSetReps,
      weight: lastSetWeight,
      observations: '',
    });
    
    setSessionExercises(updated);
  };

  const handleRemoveSet = (exerciseIdx: number, setIdx: number) => {
    const updated = [...sessionExercises];
    updated[exerciseIdx].sets = updated[exerciseIdx].sets.filter((_, i) => i !== setIdx);
    setSessionExercises(updated);
  };

  const handleUpdateSetField = (
    exerciseIdx: number,
    setIdx: number,
    field: 'targetReps' | 'actualReps' | 'weight' | 'observations',
    value: string | number
  ) => {
    const updated = [...sessionExercises];
    const currentSet = updated[exerciseIdx].sets[setIdx];
    
    if (field === 'observations') {
      currentSet.observations = String(value);
    } else if (field === 'targetReps') {
      currentSet.targetReps = value === '' ? 12 : Number(value);
    } else if (field === 'actualReps') {
      currentSet.actualReps = value === '' ? null : Number(value);
    } else if (field === 'weight') {
      currentSet.weight = value === '' ? null : Number(value);
    }
    
    setSessionExercises(updated);
  };

  const getExerciseName = (exerciseId: string) => {
    const ex = exercises.find((e) => e.id === exerciseId);
    return ex ? ex.name : 'Carregando nome do exercício...';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (sessionExercises.length === 0) {
      setMessage({ text: 'Adicione pelo menos um exercício ao seu treino.', isError: true });
      return;
    }

    for (let i = 0; i < sessionExercises.length; i++) {
      const ex = sessionExercises[i];
      if (ex.sets.length === 0) {
        setMessage({ 
          text: `O exercício "${getExerciseName(ex.exerciseId)}" não possui nenhuma série. Adicione séries ou remova o exercício.`, 
          isError: true 
        });
        return;
      }
      for (let j = 0; j < ex.sets.length; j++) {
        const set = ex.sets[j];
        if (set.targetReps === null || set.targetReps < 1) {
          setMessage({ text: 'As repetições planejadas devem ser maiores ou iguais a 1.', isError: true });
          return;
        }
      }
    }

    const payload: RegisterSessionPayload = {
      date: new Date(sessionDate).toISOString(),
      routineId: selectedRoutineId || undefined,
      exercises: sessionExercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        expectedSets: ex.expectedSets,
        sets: ex.sets.map((set) => ({
          targetReps: set.targetReps,
          actualReps: set.actualReps,
          weight: set.weight,
          observations: set.observations || undefined,
        })),
      })),
    };

    updateSessionMut.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-24 text-white">
      <AppHeader title="Editar Treino" />

      <main className="flex-1 px-5 py-6 max-w-xl mx-auto w-full space-y-6">
        <div>
          <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-2">Modificar registro</p>
          <h1 className="text-4xl font-black uppercase tracking-tight leading-tight text-white mb-1">EDITAR TREINO</h1>
          <div className="w-12 h-1 bg-brand mb-1" />
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border text-sm text-center font-bold ${
              message.isError
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-brand/10 border-brand/20 text-brand'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-surface rounded-2xl p-5 border border-border space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand">Configurações</h2>
            
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted">Data e Hora</label>
              <input
                type="datetime-local"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full bg-[#221d3d] text-white border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-wider text-muted">Ficha / Rotina Relacionada</label>
              <div className="bg-card border border-border px-4 py-3 rounded-xl text-xs font-mono text-white">
                {activeRoutine ? (
                  <span className="font-bold text-brand uppercase">{activeRoutine.name}</span>
                ) : (
                  <span className="text-muted/60 uppercase">Treino Avulso</span>
                )}
              </div>
            </div>
          </div>

          {sessionExercises.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-brand">Exercícios executados</h2>
              
              {sessionExercises.map((ex, exIdx) => (
                <div
                  key={ex.exerciseId}
                  className="bg-surface rounded-2xl border border-border overflow-hidden relative group hover:border-brand/30 transition-colors"
                >
                  <div className="px-5 py-4 bg-card/50 border-b border-border flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-base text-white">{getExerciseName(ex.exerciseId)}</h3>
                      <p className="text-[9px] font-black text-muted uppercase tracking-wider">
                        Original: {ex.expectedSets} séries
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exIdx)}
                      className="text-red-400/70 hover:text-red-400 p-1.5 transition"
                      title="Remover exercício"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    {ex.sets.length === 0 ? (
                      <p className="text-xs text-muted text-center py-2">Nenhuma série. Adicione uma série abaixo.</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-[8px] font-black uppercase tracking-wider text-muted px-1">
                          <div className="col-span-1 text-center">#</div>
                          <div className="col-span-3">Planej.</div>
                          <div className="col-span-3">Realiz.</div>
                          <div className="col-span-2">Peso (kg)</div>
                          <div className="col-span-2">Obs.</div>
                          <div className="col-span-1"></div>
                        </div>

                        {ex.sets.map((set, setIdx) => (
                          <div key={setIdx} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-1 text-center text-xs font-black text-brand font-mono">
                              {setIdx + 1}
                            </div>
                            
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={set.targetReps === null ? '' : set.targetReps}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'targetReps', e.target.value)}
                                className="w-full bg-[#221d3d] text-white border border-border rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-brand font-bold text-center font-mono"
                                min="1"
                                placeholder="Reps"
                                required
                              />
                            </div>
                            
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={set.actualReps === null ? '' : set.actualReps}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'actualReps', e.target.value)}
                                className="w-full bg-[#221d3d] text-white border border-border rounded-lg py-1.5 px-2 text-xs focus:outline-none focus:border-brand font-bold text-center font-mono"
                                min="0"
                                placeholder="Reps"
                              />
                            </div>
                            
                            {/* Carga */}
                            <div className="col-span-2">
                              <input
                                type="number"
                                value={set.weight === null ? '' : set.weight}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'weight', e.target.value)}
                                className="w-full bg-[#221d3d] text-white border border-border rounded-lg py-1.5 px-1.5 text-xs focus:outline-none focus:border-brand font-bold text-center font-mono"
                                min="0"
                                step="any"
                                placeholder="kg"
                              />
                            </div>
                            
                            {/* Observação */}
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={set.observations}
                                onChange={(e) => handleUpdateSetField(exIdx, setIdx, 'observations', e.target.value)}
                                className="w-full bg-[#221d3d] text-white border border-border rounded-lg py-1.5 px-2 text-[10px] focus:outline-none focus:border-brand"
                                placeholder="Obs"
                              />
                            </div>

                            {/* Deletar série */}
                            <div className="col-span-1 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSet(exIdx, setIdx)}
                                className="text-red-400/50 hover:text-red-400 p-1"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Botão de Adicionar Série */}
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIdx)}
                      className="w-full mt-2 border border-dashed border-border hover:border-brand/40 text-muted hover:text-brand text-[10px] font-black uppercase tracking-widest py-2 rounded-xl transition-all"
                    >
                      + Adicionar Série
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seletor para adicionar novo exercício */}
          <div className="bg-surface rounded-2xl p-5 border border-border space-y-3">
            <h2 className="text-xs font-black uppercase tracking-widest text-brand">Adicionar Novo Exercício</h2>
            <div className="flex gap-2">
              <select
                value={selectedExerciseToAdd}
                onChange={(e) => setSelectedExerciseToAdd(e.target.value)}
                className="flex-1 bg-card text-white border border-border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-brand"
              >
                <option value="">Selecione um exercício...</option>
                {exercises
                  .filter((ex) => !sessionExercises.some((se) => se.exerciseId === ex.id) && ex.active)
                  .map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} {ex.muscleGroup ? `(${ex.muscleGroup})` : ''}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddExercise}
                disabled={!selectedExerciseToAdd}
                className="bg-brand text-dark font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl hover:brightness-110 disabled:opacity-50 transition"
              >
                ADICIONAR
              </button>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/sessions/history')}
              className="flex-1 bg-[#221d3d] border border-border hover:border-brand/40 text-white font-black text-sm uppercase tracking-[0.2em] py-4 rounded-2xl transition text-center"
            >
              CANCELAR
            </button>
            
            <button
              type="submit"
              disabled={updateSessionMut.isPending}
              className="flex-2 w-full bg-gradient-to-r from-brand to-[#a8d400] text-dark font-black text-sm uppercase tracking-[0.2em] py-4 rounded-2xl hover:brightness-105 shadow-[0_0_20px_rgba(204,255,0,0.25)] disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {updateSessionMut.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" />
                  SALVANDO...
                </>
              ) : (
                'SALVAR ALTERAÇÕES'
              )}
            </button>
          </div>
        </form>
      </main>

      <BottomNavigation />
    </div>
  );
}

export function EditSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const userId = getUserIdFromToken(token);

  // Queries
  const { data: detail, isLoading: isLoadingDetail, isError: isErrorDetail } = useQuery({
    queryKey: ['session-detail', sessionId],
    queryFn: () => getSessionHistoryDetail(sessionId!),
    enabled: !!sessionId,
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

  if (!userId) {
    return <p className="text-center mt-10 text-muted">Você não está autenticado. Por favor, faça login.</p>;
  }

  if (isLoadingDetail) {
    return (
      <div className="min-h-screen bg-[#0d0b1e] flex flex-col justify-center items-center text-white">
        <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted">Carregando treino...</p>
      </div>
    );
  }

  if (isErrorDetail || !detail) {
    return (
      <div className="min-h-screen bg-[#0d0b1e] flex flex-col justify-center items-center text-white p-5">
        <p className="text-sm font-black uppercase text-red-400 mb-4">Erro ao carregar os dados deste treino.</p>
        <button
          type="button"
          onClick={() => navigate('/sessions/history')}
          className="bg-brand text-dark font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:brightness-110 transition"
        >
          Voltar ao histórico
        </button>
      </div>
    );
  }

  return (
    <EditSessionForm
      detail={detail}
      routines={routines}
      exercises={exercises}
      sessionId={sessionId!}
    />
  );
}

