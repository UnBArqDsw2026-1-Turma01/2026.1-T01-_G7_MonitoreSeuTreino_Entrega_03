import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createExercise, updateExercise, deactivateExercise } from '../services/exercises-api';
import { ExerciseList } from '../components/exercise-list';
import { ExerciseForm } from '../components/exercise-form';
import type { Exercise, CreateExercisePayload, UpdateExercisePayload } from '../types/exercises.types';
import { BottomNavigation } from '../../../shared/components/bottom-navigation';
import { AppHeader } from '../../../shared/components/app-header';

export function ExercisesPage() {
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // CORREÇÃO: invalidateQueries agora recebe um objeto { queryKey: [...] }
  const createMut = useMutation({
    mutationFn: createExercise,
    onSuccess: () => { setMessage('Exercício cadastrado com sucesso'); setShowCreate(false); queryClient.invalidateQueries({ queryKey: ['exercises'] }); }
  });

  const updateMut = useMutation({
    mutationFn: updateExercise,
    onSuccess: () => { setMessage('Exercício atualizado com sucesso'); setEditing(null); queryClient.invalidateQueries({ queryKey: ['exercises'] }); }
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateExercise(id),
    onSuccess: () => { setMessage('Exercício inativado'); queryClient.invalidateQueries({ queryKey: ['exercises'] }); }
  });

  return (
    <div className="min-h-screen bg-[#0d0b1e] flex flex-col pb-20">
      <AppHeader title="Exercícios" />

      <main className="flex-1 px-5 py-6 mx-auto w-full max-w-[480px]">
        <div className="mb-8">
          <button onClick={() => setShowCreate(true)} className="w-full bg-[#ccff00] text-[#0d0b1e] font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 py-4 rounded-lg hover:brightness-110 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            CADASTRAR NOVO EXERCÍCIO
          </button>
        </div>

        {message && (
          <div className="mb-6 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-lg p-3 text-[#ccff00] text-sm text-center font-medium">{message}</div>
        )}

        <ExerciseList onEdit={(ex) => setEditing(ex)} onDeactivate={(id) => { if (confirm('Deseja realmente inativar este exercício?')) deactivateMut.mutate(id); }} />

        {/* MODAL CADASTRAR EXERCÍCIO */}
        {showCreate && (
          <div className="fixed inset-0 bg-[#0d0b1e]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1a1333] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-[#2d244a]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d244a]">
                <h2 className="text-white font-black text-lg">Cadastrar Exercício</h2>
                <button onClick={() => setShowCreate(false)} className="text-[#8b7fa8] hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {/* CORREÇÃO: isLoading substituído por isPending nas mutations */}
                <ExerciseForm isSubmitting={createMut.isPending} onSubmit={(v) => createMut.mutate(v as CreateExercisePayload)} submitLabel="CONFIRMAR" onCancel={() => setShowCreate(false)} />
              </div>
            </div>
          </div>
        )}

        {/* MODAL EDITAR EXERCÍCIO */}
        {editing && (
          <div className="fixed inset-0 bg-[#0d0b1e]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1a1333] w-full max-w-sm rounded-xl overflow-hidden shadow-2xl border border-[#2d244a]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#2d244a]">
                <h2 className="text-white font-black text-lg">Editar Exercício</h2>
                <button onClick={() => setEditing(null)} className="text-[#8b7fa8] hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="p-6">
                {/* CORREÇÃO: isLoading substituído por isPending nas mutations */}
                <ExerciseForm defaultValues={editing} isSubmitting={updateMut.isPending} onSubmit={(v) => updateMut.mutate({ ...(v as UpdateExercisePayload), id: editing.id })} submitLabel="CONFIRMAR" onCancel={() => setEditing(null)} />
              </div>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation></BottomNavigation>
    </div>
  );
}