import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cloneRoutine } from '../services/routine-api';
import type { CloneRoutineData } from '../schemas/clone-routine.schema';

export function useCloneRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CloneRoutineData) => cloneRoutine(data.routineId, data.userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
    onError: (error) => {
      console.error('Erro ao clonar rotina:', error);
    },
  });
}