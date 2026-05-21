import { Exercise } from '../entities/exercise.entity';

export interface ExerciseSearchCriteria {
  userId: string;
  name?: string;
  muscleGroup?: string;
}

export interface ExerciseRepository {
  save(exercise: Exercise): Promise<void>;
  findById(id: string): Promise<Exercise | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Exercise | null>;
  findMany(criteria: ExerciseSearchCriteria): Promise<Exercise[]>;
  update(exercise: Exercise): Promise<void>;
}

export const EXERCISE_REPOSITORY = Symbol('EXERCISE_REPOSITORY');