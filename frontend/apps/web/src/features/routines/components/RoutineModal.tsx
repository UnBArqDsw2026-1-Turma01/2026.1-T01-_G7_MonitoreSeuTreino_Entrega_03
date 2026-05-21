import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateRoutine, createRoutine, type Division } from '../services/routine-api';

import { searchExercises } from '../../exercises/services/exercises-api';

export function RoutineModal({
  isOpen,
  onClose,
  initialData,
  userId
}: {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  userId: string;
}) {
  const [routineName, setRoutineName] = useState('');
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [activeDivisionIndex, setActiveDivisionIndex] = useState(0);

  const queryClient = useQueryClient();

  const { data: availableExercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => searchExercises(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRoutineName(initialData?.name || '');
       
      setDivisions(initialData?.divisions || [{ name: 'TREINO A', exercises: [] }]);
       
      setActiveDivisionIndex(0);
    }
  }, [isOpen, initialData]);

  const handleClose = () => {
    setRoutineName('');
    setDivisions([{ name: 'TREINO A', exercises: [] }]);
    setActiveDivisionIndex(0);
    onClose();
  };

  const updateMutation = useMutation({
    mutationFn: () => updateRoutine(initialData.id, userId, routineName, divisions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      handleClose();
    }
  });

  const createMutation = useMutation({
    mutationFn: () => createRoutine(routineName, userId, divisions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      handleClose();
    }
  });

  const handleAddDivision = () => {
    const nextLetter = String.fromCharCode(65 + divisions.length);
    setDivisions([...divisions, { name: `TREINO ${nextLetter}`, exercises: [] }]);
    setActiveDivisionIndex(divisions.length);
  };

  const handleRemoveDivision = (idxToRemove: number) => {
    if (divisions.length <= 1) return;
    const newDivisions = divisions.filter((_, idx) => idx !== idxToRemove);

    const renamedDivisions = newDivisions.map((div, idx) => ({
      ...div,
      name: `TREINO ${String.fromCharCode(65 + idx)}`
    }));

    setDivisions(renamedDivisions);
    setActiveDivisionIndex(Math.max(0, activeDivisionIndex - 1));
  };

  const handleAddExercise = () => {
    const newDivisions = [...divisions];
    newDivisions[activeDivisionIndex].exercises.push({
      exerciseId: '',
      targetSets: 4,
      targetReps: '8-12'
    });
    setDivisions(newDivisions);
  };

  const handleExerciseChange = (exIndex: number, field: string, value: string | number) => {
    const newDivisions = [...divisions];
    newDivisions[activeDivisionIndex].exercises[exIndex] = {
      ...newDivisions[activeDivisionIndex].exercises[exIndex],
      [field]: value
    };
    setDivisions(newDivisions);
  };

  const handleRemoveExercise = (exIndex: number) => {
    const newDivisions = [...divisions];
    newDivisions[activeDivisionIndex].exercises.splice(exIndex, 1);
    setDivisions(newDivisions);
  };

  if (!isOpen) return null;

  const activeDivision = divisions[activeDivisionIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0b1e]/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1530] flex flex-col max-h-[90vh] shadow-2xl border border-[rgba(139,127,168,0.15)] overflow-hidden">

        <div className="flex justify-between items-center p-6 border-b border-[rgba(139,127,168,0.15)]">
          <h2 className="text-xl font-black text-white">{initialData ? 'Editar Ficha' : 'Cadastrar Ficha'}</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">

          <div>
            <label className="text-[10px] font-bold text-[#00e5ff] tracking-widest uppercase block mb-2">NOME DA FICHA</label>
            <input
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full bg-transparent border-b border-[rgba(139,127,168,0.3)] pb-2 text-white outline-none placeholder-[#8b7fa8] focus:border-[#ccff00] transition-colors"
              placeholder="Ex: Summer Prep"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-bold text-white tracking-widest uppercase">DIVISÕES / DIAS</label>
              <button onClick={handleAddDivision} className="text-[10px] font-bold text-[#00e5ff] uppercase flex items-center gap-1">
                ⊕ ADICIONAR
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {divisions.map((div, idx) => (
                <div key={idx} className="flex flex-col gap-1 items-center">
                  <button
                    onClick={() => setActiveDivisionIndex(idx)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors ${
                      activeDivisionIndex === idx
                      ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]'
                      : 'border border-[rgba(139,127,168,0.3)] text-[#8b7fa8] hover:text-white'
                    }`}
                  >
                    {div.name}
                  </button>
                  {divisions.length > 1 && activeDivisionIndex === idx && (
                    <button onClick={() => handleRemoveDivision(idx)} className="text-[9px] text-red-500 font-bold uppercase hover:text-red-400">Excluir</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-white mb-4">Exercícios - {activeDivision?.name}</h3>

            <div className="space-y-4 mb-4">
              {activeDivision?.exercises.map((ex, exIndex) => (
                <div key={exIndex} className="relative bg-[#0d0b1e] rounded-xl p-4 border-l-2 border-[#ccff00]">
                  <button
                    onClick={() => handleRemoveExercise(exIndex)}
                    className="absolute top-4 right-4 text-red-500 hover:text-red-400"
                  >
                    🗑
                  </button>

                  {/* O Dropdown substituindo o Input antigo */}
                  {isLoadingExercises ? (
                    <p className="text-[#8b7fa8] text-[10px] uppercase mb-2">Carregando exercícios...</p>
                  ) : (
                    <select
                      value={ex.exerciseId}
                      onChange={(e) => handleExerciseChange(exIndex, 'exerciseId', e.target.value)}
                      className="bg-transparent text-[#ccff00] font-black text-base outline-none w-[85%] mb-1 pb-1 border-b border-[rgba(139,127,168,0.3)] appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-gray-500 bg-[#1a1530]">Selecione um exercício...</option>
                      {availableExercises.map((exercise: { id: string; name: string }) => (
                        <option key={exercise.id} value={exercise.id} className="text-white bg-[#1a1530]">
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <span className="block text-[9px] font-bold text-[#8b7fa8] uppercase tracking-widest mb-4">Exercício {String(exIndex + 1).padStart(2, '0')}</span>

                  <div className="flex gap-3">
                    <div className="flex-1 bg-[#1a1530] rounded-lg p-3 text-center">
                      <label className="block text-[9px] font-bold text-white uppercase tracking-widest mb-1">Séries</label>
                      <input
                        type="number"
                        value={ex.targetSets}
                        onChange={(e) => handleExerciseChange(exIndex, 'targetSets', Number(e.target.value))}
                        className="bg-transparent w-full text-center text-[#00e5ff] font-black text-xl outline-none"
                      />
                    </div>
                    <div className="flex-1 bg-[#1a1530] rounded-lg p-3 text-center">
                      <label className="block text-[9px] font-bold text-white uppercase tracking-widest mb-1">Reps Alvo</label>
                      <input
                        value={ex.targetReps}
                        onChange={(e) => handleExerciseChange(exIndex, 'targetReps', e.target.value)}
                        className="bg-transparent w-full text-center text-[#00e5ff] font-black text-xl outline-none"
                        placeholder="Ex: 8-12"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddExercise}
              className="w-full py-4 border border-dashed border-[rgba(139,127,168,0.3)] rounded-xl text-xs font-bold text-[#8b7fa8] uppercase tracking-widest hover:text-white hover:border-white transition-colors flex items-center justify-center gap-2"
            >
              ⊕ Novo Exercício
            </button>
          </div>
        </div>

        <div className="p-6 pt-2 bg-[#1a1530]">
          <button
            onClick={() => initialData ? updateMutation.mutate() : createMutation.mutate()}
            className="w-full bg-[#ccff00] text-black font-black py-4 rounded-xl shadow-[0_0_20px_rgba(204,255,0,0.15)] hover:brightness-110 transition-all tracking-wider disabled:opacity-50"
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || updateMutation.isPending ? 'SALVANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
}