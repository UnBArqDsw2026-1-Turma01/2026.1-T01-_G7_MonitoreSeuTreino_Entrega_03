import { apiClient } from '../../../shared/lib/http/api-client';
import type {
  Exercise,
  CreateExercisePayload,
  UpdateExercisePayload,
  SearchExercisesParams,
} from '../types/exercises.types';

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeExerciseParams(params?: SearchExercisesParams) {
  return {
    ...(normalizeOptionalText(params?.name) ? { name: normalizeOptionalText(params?.name) } : {}),
    ...(normalizeOptionalText(params?.muscleGroup)
      ? { muscleGroup: normalizeOptionalText(params?.muscleGroup) }
      : {}),
  };
}

function normalizeExercisePayload<T extends { muscleGroup?: string | null }>(payload: T) {
  return {
    ...payload,
    muscleGroup: normalizeOptionalText(payload.muscleGroup),
  };
}

export async function searchExercises(params?: SearchExercisesParams): Promise<Exercise[]> {
  const { data } = await apiClient.get<{ data: Exercise[] }>('/v1/exercises', {
    params: normalizeExerciseParams(params),
  });
  return data.data;
}

export async function createExercise(payload: CreateExercisePayload): Promise<Exercise> {
  const { data } = await apiClient.post<Exercise>(
    '/v1/exercises',
    normalizeExercisePayload(payload),
  );
  return data;
}

export async function updateExercise(payload: UpdateExercisePayload): Promise<Exercise> {
  const { id, name, muscleGroup } = payload;
  const { data } = await apiClient.put<Exercise>(
    `/v1/exercises/${id}`,
    normalizeExercisePayload({ name, muscleGroup }),
  );
  return data;
}

export async function deactivateExercise(id: string): Promise<void> {
  await apiClient.patch(`/v1/exercises/${id}/deactivate`);
}
