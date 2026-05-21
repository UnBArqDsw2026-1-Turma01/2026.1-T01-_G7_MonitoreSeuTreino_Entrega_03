import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createExercise, updateExercise, deactivateExercise } from '../services/exercises-api';
import { ExerciseList } from '../components/exercise-list';
import { ExerciseForm } from '../components/exercise-form';
import type { Exercise, CreateExercisePayload, UpdateExercisePayload } from '../types/exercises.types';

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div className={['flex flex-col items-center gap-1 py-2 px-3 min-w-[56px]', active ? 'text-[#ccff00]' : 'text-[#8b7fa8]'].join(' ')}>
      {icon}
      <span className="text-[10px] font-bold tracking-widest uppercase">{label}</span>
    </div>
  );
}

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
      <header className="flex items-center justify-between px-6 py-5 border-b border-[rgba(139,127,168,0.15)] relative">
        <span className="text-[#ccff00] font-black text-xl tracking-tight">Exercícios</span>
        <svg className="text-[#ccff00]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </header>

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

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1530] border-t border-[rgba(139,127,168,0.15)] flex items-center justify-around px-2 z-50">
        <Link to="/">
          <NavItem
            label="Início"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            }
          />
        </Link>
        <Link to="/exercises">
          <NavItem
            active
            label="Exercícios"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6.5 6.5h11M6.5 17.5h11M4 12h16" strokeLinecap="round" />
                <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            }
          />
        </Link>
        <div className="flex flex-col items-center gap-1 py-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ccff00] to-[#a8d400] flex items-center justify-center shadow-[0_0_20px_rgba(204,255,0,0.35)] -mt-6">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z" fill="#0d0b1e" />
            </svg>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#ccff00]">Gravar</span>
        </div>
        <NavItem
          label="Rotina"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
          }
        />
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