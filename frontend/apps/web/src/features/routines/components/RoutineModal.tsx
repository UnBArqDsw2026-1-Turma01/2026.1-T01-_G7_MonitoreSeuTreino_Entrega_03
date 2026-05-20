import { useState } from 'react';
import { useCloneRoutine } from '../hooks/use-clone-routine';
import { updateRoutine, activateRoutine } from '../services/routine-api';

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
  const [errorMessage, setErrorMessage] = useState('');
  const [divisions, setDivisions] = useState<Division[]>(
    initialData?.divisions || [{ name: 'TREINO A', exercises: [] }]
  );

  const { mutate: cloneRoutine, isPending: isCloning } = useCloneRoutine();
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock do ID do usuário logado para o teste
  const currentUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  const targetRoutineId = initialData?.id || 'd3b07384-d113-4318-971a-297eb098b67b';

  if (!isOpen) return null;

  const handleSave = async () => {
    setErrorMessage('');
    setIsProcessing(true);

    try {
      if (initialData) {
        // Teste do PROXY: Tenta atualizar o nome direto
        await updateRoutine(targetRoutineId, currentUserId, routineName);
        onClose();
      } else {
        // Teste do PROTOTYPE: Clona a rotina
        cloneRoutine(
          { routineId: targetRoutineId, userId: currentUserId, newName: routineName },
          { onSuccess: () => onClose() }
        );
      }
    } catch (error: any) {
      // O proxy estoura a exceção
      setErrorMessage(error.response?.data?.message || 'Erro do Proxy: Não é permitido editar rotinas com histórico!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    try {
      // Teste do MEDIATOR: Ativa e desativa as outras no back
      await activateRoutine(targetRoutineId, currentUserId);
      alert('Rotina ativada com sucesso! As outras foram desativadas pelo Mediator.');
      onClose();
    } catch (error) {
      setErrorMessage('Erro ao ativar rotina.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-white">
      <div className="w-full max-w-md rounded-lg bg-[#1E1A2D] p-6 shadow-xl">

        <div className="flex items-center justify-between border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Ficha (Teste Proxy)' : 'Clonar Ficha (Teste Prototype)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded bg-red-500/20 border border-red-500 p-3 text-sm text-red-200">
            {errorMessage}
          </div>
        )}

        <div className="mt-6 space-y-6 max-h-[50vh] overflow-y-auto pr-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-teal-400 uppercase tracking-wider">
              Nome da Ficha
            </label>
            <input
              type="text"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full border-b border-gray-600 bg-transparent py-2 text-white outline-none focus:border-teal-400"
            />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={isCloning || isProcessing}
            className="w-full rounded bg-[#D4FF3E] py-3 font-bold text-black hover:bg-[#bce62b] disabled:opacity-50"
          >
            {(isCloning || isProcessing) ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
          </button>

          {initialData && (
            <button
              onClick={handleActivate}
              disabled={isProcessing}
              className="w-full rounded border border-[#D4FF3E] py-3 font-bold text-[#D4FF3E] hover:bg-[#D4FF3E]/10 disabled:opacity-50"
            >
              ATIVAR ESTA ROTINA (Teste Mediator)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}