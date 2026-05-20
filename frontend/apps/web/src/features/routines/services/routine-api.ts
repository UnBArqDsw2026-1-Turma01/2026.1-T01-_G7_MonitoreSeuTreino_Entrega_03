import { apiClient } from '../../../shared/lib/http/api-client';
import type { CloneRoutineData } from '../schemas/clone-routine.schema';

export async function cloneRoutine(data: CloneRoutineData): Promise<void> {
  await apiClient.post(`/routines/${data.routineId}/clone`, {
    userId: data.userId,
    newName: data.newName,
  });
}