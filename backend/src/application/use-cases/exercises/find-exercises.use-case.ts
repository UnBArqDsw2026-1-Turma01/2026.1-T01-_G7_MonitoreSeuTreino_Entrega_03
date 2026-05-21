import { Exercise } from '@domain/exercises/entities/exercise.entity';
import {
  ExerciseRepository,
  ExerciseSearchCriteria,
} from '@domain/exercises/repositories/exercise.repository';

export interface FindExercisesQuery {
  userId: string;
  name?: string;
  muscleGroup?: string;
}

export class FindExercisesUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  execute(query: FindExercisesQuery): Promise<Exercise[]> {
    const criteria: ExerciseSearchCriteria = {
      userId: query.userId,
      name: query.name,
      muscleGroup: query.muscleGroup,
    };

    return this.exerciseRepository.findMany(criteria);
  }
}
