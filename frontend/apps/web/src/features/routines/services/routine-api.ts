import { apiClient } from '../../../shared/lib/http/api-client';

export interface Exercise {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
}

export interface Division {
  name: string;
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  name: string;
  divisions: Division[];
  isActive: boolean;
}

export async function fetchRoutines(userId: string): Promise<Routine[]> {
  const { data } = await apiClient.get('/routines', {
    params: { userId }
  });
  return data;
}

export async function createRoutine(name: string, userId: string, divisions: Division[]): Promise<void> {
  await apiClient.post(`/routines`, { name, userId, divisions });
}

export async function cloneRoutine(id: string, userId: string): Promise<void> {
  await apiClient.post(`/routines/${id}/clone`, { userId });
}

export async function updateRoutine(
  routineId: string,
  userId: string,
  newName: string,
  divisions: Division[]
): Promise<void> {
  await apiClient.put(`/routines/${routineId}`, {
    userId,
    newName,
    divisions
  });
}

export async function activateRoutine(routineId: string, userId: string): Promise<void> {
  await apiClient.patch(`/routines/${routineId}/activate`, { userId });
}

export async function deleteRoutine(routineId: string): Promise<void> {
  await apiClient.delete(`/routines/${routineId}`);
}

export async function inactivateRoutine(routineId: string): Promise<void> {
  await apiClient.patch(`/routines/${routineId}/inactivate`);
}