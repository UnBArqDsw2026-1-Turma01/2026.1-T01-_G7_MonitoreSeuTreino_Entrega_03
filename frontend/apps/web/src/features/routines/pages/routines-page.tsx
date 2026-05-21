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

export function RoutinesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const queryClient = useQueryClient();
  const userId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  // Busca as fichas no Backend
  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['routines'],
    queryFn: fetchRoutines,
  });

  // Prototype: Duplicar ficha
  const cloneMutation = useMutation({
    mutationFn: (id: string) => cloneRoutine(id, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] }),
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => activateRoutine(id, userId),
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

  const handleOpenModal = (routine?: any) => {
    setSelectedRoutine(routine || null);
    setIsModalOpen(true);
  };

  const currentRoutine = routines.find(r => r.isActive);
  const otherRoutines = routines.filter(r => !r.isActive);

  const countExercises = (routine: Routine) => {
    if (!routine.divisions) return 0;
    return routine.divisions.reduce((total, div) => total + (div.exercises?.length || 0), 0);
  };

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-20 font-sans text-white">
      <header className="flex items-center justify-between px-5 py-4 border-b border-[rgba(139,127,168,0.15)]">
        <span className="text-[#ccff00] font-black text-xl tracking-tight">Fichas de Treino</span>
      </header>

      <main className="flex-1 px-5 py-6 max-w-2xl mx-auto w-full space-y-8">

        {isLoading ? (
           <p className="text-center text-gray-500 mt-10">Carregando fichas...</p>
        ) : routines.length === 0 ? (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4">SUAS FICHAS</h2>
            <div className="text-center py-10 border border-dashed border-[rgba(139,127,168,0.3)] rounded-2xl">
              <p className="text-[#8b7fa8] text-sm">Nenhuma ficha encontrada.</p>
            </div>
          </section>
        ) : (
          <>
            {currentRoutine && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4">FICHA ATUAL</h2>
                <div className="bg-[#1E1A2D] rounded-2xl p-5 border border-[rgba(139,127,168,0.15)] relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ccff00]"></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-[#ccff00] text-black text-[10px] font-bold px-2 py-1 rounded">ACTIVE</span>
                  </div>
                  <h3 className="text-xl font-black uppercase leading-tight mb-1">{currentRoutine.name}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-400 text-xs font-bold">↗ {countExercises(currentRoutine)} EXERCÍCIOS</span>
                    <button
                      onClick={() => inactivateMutation.mutate(currentRoutine.id)}
                      className="text-red-400 text-xs font-bold uppercase hover:text-red-300"
                    >
                      ⊘ INATIVAR
                    </button>
                  </div>
                </div>
              </section>
            )}

            {otherRoutines.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 tracking-widest uppercase mb-4 mt-8">OUTRAS FICHAS</h2>
                <div className="space-y-4">
                  {otherRoutines.map((routine) => (
                    <div key={routine.id} className="bg-[#1E1A2D] rounded-2xl p-5 border border-[rgba(139,127,168,0.15)]">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-black uppercase">{routine.name}</h3>
                        <button
                          onClick={() => activateMutation.mutate(routine.id)}
                          className="border border-[rgba(139,127,168,0.3)] text-gray-300 text-[10px] font-bold px-3 py-1.5 rounded uppercase hover:text-white"
                        >
                          ATIVAR
                        </button>
                      </div>

                      <div className="flex items-center justify-end gap-4 mt-2">
                        {/* BOTÃO DUPLICAR - PROTOTYPE PATTERN */}
                        <button
                          onClick={() => cloneMutation.mutate(routine.id)}
                          className="text-[#ccff00] text-[10px] font-bold uppercase hover:text-white flex items-center gap-1"
                        >
                          ⧉ DUPLICAR
                        </button>
                        <button
                          onClick={() => handleOpenModal(routine)}
                          className="text-gray-300 text-[10px] font-bold uppercase hover:text-white flex items-center gap-1"
                        >
                          ✎ EDITAR
                        </button>
                        <button
                          onClick={() => window.confirm('Excluir?') && deleteMutation.mutate(routine.id)}
                          className="text-red-400 text-[10px] font-bold uppercase hover:text-red-300 flex items-center gap-1"
                        >
                          🗑 EXCLUIR
                        </button>
                      </div>
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
      />

    <BottomNavigation />
    </div>
  );
}