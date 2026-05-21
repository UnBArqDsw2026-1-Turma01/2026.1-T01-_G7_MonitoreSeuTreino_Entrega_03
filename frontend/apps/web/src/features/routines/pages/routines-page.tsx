import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoutineModal } from '../components/RoutineModal';
import {
  fetchRoutines,
  deleteRoutine,
  activateRoutine,
  inactivateRoutine,
  cloneRoutine
} from '../services/routine-api';
import type { Routine } from '../services/routine-api';
import { BottomNavigation } from '../../../shared/components/bottom-navigation';
import { useAuthStore } from '../../auth/store/auth-store';
import { searchExercises } from '../../exercises/services/exercises-api';
import { AppHeader } from '../../../shared/components/app-header';

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

export function RoutinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);

  // ESTADOS PARA EXPANSÃO E ABAS
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [activeDivisionIndex, setActiveDivisionIndex] = useState(0);

  const queryClient = useQueryClient();
  const { token } = useAuthStore();
  const userId = getUserIdFromToken(token);

  // REGRAS DOS HOOKS: Todos os hooks devem ser chamados antes de qualquer "return" (if !userId)
  const { data: routines = [], isLoading: isLoadingRoutines } = useQuery({
    queryKey: ['routines', userId],
    queryFn: () => fetchRoutines(userId!),
    enabled: !!userId,
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => searchExercises(),
    enabled: !!userId,
  });

  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneRoutine(id, userId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateRoutine(id, userId!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const inactivateMutation = useMutation({
    mutationFn: (id: string) => inactivateRoutine(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRoutine(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenModal = (routine?: any) => {
    setSelectedRoutine(routine || null);
    setIsModalOpen(true);
  };

   
  const getExerciseName = (exerciseId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exercise = exercises.find((ex: any) => ex.id === exerciseId);
    return exercise ? exercise.name : 'Exercício não encontrado';
  };

  // LÓGICA REFINADA DE EXPANSÃO
  const toggleExpand = (routineId: string) => {
    if (expandedRoutineId === routineId) {
      setExpandedRoutineId(null); // Fecha se clicar no mesmo
    } else {
      setExpandedRoutineId(routineId); // Abre o novo
      setActiveDivisionIndex(0); // Reseta a aba para a primeira divisão (Treino A)
    }
  };

  const currentRoutine = routines.find(r => r.isActive);
  const otherRoutines = routines.filter(r => !r.isActive);

  const countExercises = (routine: Routine) => {
    if (!routine.divisions) return 0;
    return routine.divisions.reduce((total, div) => total + (div.exercises?.length || 0), 0);
  };

  // FUNÇÃO AUXILIAR: Transformado de componente para função para evitar erro no React Compiler
  const renderExpandedDetails = (routine: Routine) => {
    if (expandedRoutineId !== routine.id) return null;

    const activeDiv = routine.divisions[activeDivisionIndex];

    return (
      <div
        className="mt-4 pt-4 border-t border-[rgba(139,127,168,0.15)] animate-in slide-in-from-top-2 duration-200"
        onClick={(e) => e.stopPropagation()} // Impede que clicar nas abas feche o card
      >
        {/* Navegação entre Divisões (Treino A, B, C...) */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 custom-scrollbar">
          {routine.divisions.map((div, idx) => (
            <button
              key={idx}
              onClick={(e) => { e.stopPropagation(); setActiveDivisionIndex(idx); }}
              className={`px-3 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-colors ${
                activeDivisionIndex === idx
                  ? 'bg-[#ccff00] text-black shadow-[0_0_10px_rgba(204,255,0,0.2)]'
                  : 'border border-[rgba(139,127,168,0.3)] text-[#8b7fa8] hover:text-white'
              }`}
            >
              {div.name}
            </button>
          ))}
        </div>

        {/* Lista de Exercícios apenas da Divisão Ativa */}
        <div className="space-y-2">
          {!activeDiv || activeDiv.exercises.length === 0 ? (
            <p className="text-xs text-[#8b7fa8]">Nenhum exercício cadastrado.</p>
          ) : (
            activeDiv.exercises.map((ex, exIdx) => (
              <div key={exIdx} className="bg-[#1a1530] rounded-lg p-3 flex justify-between items-center border border-[rgba(139,127,168,0.3)]">
                <span className="text-sm font-bold text-white">{getExerciseName(ex.exerciseId)}</span>
                <div className="text-right">
                  <span className="block text-[9px] text-[#8b7fa8] uppercase font-bold tracking-wider">Séries x Reps</span>
                  <span className="text-sm font-black text-[#00e5ff]">{ex.targetSets} x {ex.targetReps}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // FUNÇÃO AUXILIAR: Ícone Chevron Transformado para função
  const renderChevronIcon = (isExpanded: boolean) => (
    <svg
      className={`w-4 h-4 text-[#8b7fa8] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );

  // EARLY RETURN COLOCADO DEPOIS DOS HOOKS
  if (!userId) {
     return <p className="text-center mt-10">Você não está autenticado. Por favor, faça login.</p>;
  }

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-20 font-sans text-white">
      <AppHeader title="Fichas de Treino" />

      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-8">
        {isLoadingRoutines ? (
           <p className="text-center text-[#8b7fa8] mt-10">Carregando fichas...</p>
        ) : routines.length === 0 ? (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">SUAS FICHAS</h2>
            <div className="text-center py-10 border border-dashed border-[rgba(139,127,168,0.3)] rounded-2xl">
              <p className="text-[#8b7fa8] text-sm">Nenhuma ficha encontrada.</p>
            </div>
          </section>
        ) : (
          <>
            {/* FICHA ATUAL */}
            {currentRoutine && (
              <section>
                <h2 className="text-sm font-bold text-[#8b7fa8] tracking-widest uppercase mb-4">FICHA ATUAL</h2>
                <div
                  onClick={() => toggleExpand(currentRoutine.id)}
                  className="bg-[#1E1A2D] rounded-2xl p-5 border border-[rgba(139,127,168,0.15)] relative overflow-hidden cursor-pointer hover:border-[rgba(204,255,0,0.3)] transition-colors group"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ccff00]"></div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="bg-[#ccff00] text-black text-[10px] font-bold px-2 py-1 rounded">ACTIVE</span>
                    {/* CHAMANDO FUNÇÃO EM VEZ DE COMPONENTE */}
                    {renderChevronIcon(expandedRoutineId === currentRoutine.id)}
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight mb-1">{currentRoutine.name}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[#8b7fa8] text-xs font-bold">↗ {countExercises(currentRoutine)} EXERCÍCIOS</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); inactivateMutation.mutate(currentRoutine.id); }}
                      className="text-red-400 text-xs font-bold uppercase hover:text-red-300"
                    >
                      ⊘ INATIVAR
                    </button>
                  </div>

                  {/* CHAMANDO FUNÇÃO EM VEZ DE COMPONENTE */}
                  {renderExpandedDetails(currentRoutine)}
                </div>
              </section>
            )}

            {/* OUTRAS FICHAS */}
            {otherRoutines.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[#8b7fa8] tracking-widest uppercase mb-4 mt-8">OUTRAS FICHAS</h2>
                <div className="space-y-4">
                  {otherRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      onClick={() => toggleExpand(routine.id)}
                      className="bg-[#1E1A2D] rounded-2xl p-5 border border-[rgba(139,127,168,0.15)] cursor-pointer hover:border-[rgba(204,255,0,0.3)] transition-colors group"
                    >
                      <div className="flex justify-between items-center mb-3">
                         <h3 className="text-lg font-black uppercase">{routine.name}</h3>
                         <div className="flex items-center gap-3">
                           <button
                             onClick={(e) => { e.stopPropagation(); activateMutation.mutate(routine.id); }}
                             className="border border-[rgba(139,127,168,0.3)] text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded uppercase hover:text-white"
                           >
                             ATIVAR
                           </button>
                           {/* CHAMANDO FUNÇÃO EM VEZ DE COMPONENTE */}
                           {renderChevronIcon(expandedRoutineId === routine.id)}
                         </div>
                      </div>

                      <div className="flex items-center justify-end gap-4 mt-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); cloneMutation.mutate(routine.id); }}
                          className="text-[#ccff00] text-[10px] font-bold uppercase hover:text-white flex items-center gap-1"
                        >
                          ⧉ DUPLICAR
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenModal(routine); }}
                          className="text-gray-300 text-[10px] font-bold uppercase hover:text-white flex items-center gap-1"
                        >
                          ✎ EDITAR
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Excluir?')) deleteMutation.mutate(routine.id);
                          }}
                          className="text-red-400 text-[10px] font-bold uppercase hover:text-red-300 flex items-center gap-1"
                        >
                          🗑 EXCLUIR
                        </button>
                      </div>

                      {/* CHAMANDO FUNÇÃO EM VEZ DE COMPONENTE */}
                      {renderExpandedDetails(routine)}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <button
        onClick={() => handleOpenModal()}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#ccff00] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:brightness-110"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0d0b1e" strokeWidth="3">
          <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
        </svg>
      </button>

      <RoutineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedRoutine}
        userId={userId!}
      />

    <BottomNavigation />
    </div>
  );
}