export type Exercise = {
  id: string;
  userId: string;
  name: string;
  muscleGroup?: string | null;
  active: boolean;
};

export type CreateExercisePayload = {
  name: string;
  muscleGroup?: string | null;
};

export type UpdateExercisePayload = {
  id: string;
  name?: string;
  muscleGroup?: string | null;
};

export type SearchExercisesParams = {
  name?: string;
  muscleGroup?: string;
};
