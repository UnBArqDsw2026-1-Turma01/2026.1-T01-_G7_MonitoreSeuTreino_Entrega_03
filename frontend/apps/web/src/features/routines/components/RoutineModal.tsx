import { useState } from 'react';
import { useCloneRoutine } from '../hooks/use-clone-routine';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
}

interface Division {
  name: string;
  exercises: Exercise[];
}

interface RoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function RoutineModal({ isOpen, onClose, initialData }: RoutineModalProps) {
  const [routineName, setRoutineName] = useState(initialData?.name || '');
  const [divisions, setDivisions] = useState<Division[]>(
    initialData?.divisions || [{ name: 'TREINO A', exercises: [] }]
  );

  const { mutate: cloneRoutine, isPending } = useCloneRoutine();

  if (!isOpen) return null;

  const handleSave = () => {

    cloneRoutine(
      {
        routineId: initialData?.id || 'd3b07384-d113-4318-971a-297eb098b67b',
        userId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        newName: routineName,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-white">
      <div className="w-full max-w-md rounded-lg bg-[#1E1A2D] p-6 shadow-xl">

        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Clonar/Editar Ficha' : 'Cadastrar Ficha'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">

          <div>
            <label className="mb-1 block text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Nome da Ficha
            </label>
            <input
              type="text"
              placeholder="Ex: Summer Prep"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full border-b border-gray-600 bg-transparent py-2 text-white placeholder-gray-500 outline-none focus:border-teal-400"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
              Divisões / Dias
            </span>
            <button className="text-xs font-bold text-teal-400 flex items-center gap-1">
              ⊕ ADICIONAR
            </button>
          </div>

          {divisions.map((div, idx) => (
            <div key={idx} className="space-y-4">
              <button className="rounded-md bg-[#D4FF3E] px-4 py-1 text-sm font-bold text-black">
                {div.name}
              </button>

              <h3 className="text-lg font-bold">Exercícios - {div.name}</h3>

              <div className="rounded-md bg-[#2A243D] p-4 border-l-2 border-[#D4FF3E]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-[#D4FF3E]">Supino Reto c/ Barra</h4>
                    <span className="text-[10px] text-gray-400 tracking-wider">EXERCÍCIO 01</span>
                  </div>
                  <button className="text-red-500 hover:text-red-400">🗑️</button>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 rounded bg-[#362E4D] p-2 text-center">
                    <span className="block text-[10px] uppercase text-gray-400">Séries</span>
                    <span className="font-bold text-teal-400">4</span>
                  </div>
                  <div className="flex-1 rounded bg-[#362E4D] p-2 text-center">
                    <span className="block text-[10px] uppercase text-gray-400">Reps Alvo</span>
                    <span className="font-bold text-teal-400">8-12</span>
                  </div>
                </div>
              </div>

              <button className="w-full rounded border border-dashed border-gray-600 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800">
                ⊕ NOVO EXERCÍCIO
              </button>
            </div>
          ))}

        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full rounded bg-[#D4FF3E] py-3 font-bold text-black hover:bg-[#bce62b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'SALVANDO...' : 'CONFIRMAR'}
          </button>
        </div>
      </div>
    </div>
  );
}