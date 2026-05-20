import { apiClient } from '../../../shared/lib/http/api-client';
import type { CloneRoutineData } from '../schemas/clone-routine.schema';


// Rota para o PROTOTYPE
export async function cloneRoutine(data: CloneRoutineData): Promise<void> {
  await apiClient.post(`/routines/${data.routineId}/clone`, {
    userId: data.userId,
    newName: data.newName,
  });
}

// Rota para o PROXY
export async function updateRoutine(routineId: string, userId: string, newName: string): Promise<void> {
  await apiClient.put(`/routines/${routineId}`, { userId, newName });
}

// Rota para o MEDIATOR
export async function activateRoutine(routineId: string, userId: string): Promise<void> {
  await apiClient.patch(`/routines/${routineId}/activate`, { userId });
}