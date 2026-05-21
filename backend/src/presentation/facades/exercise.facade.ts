import { Exercise } from '@domain/exercises/entities/exercise.entity';
import { CreateExerciseUseCase } from '@application/use-cases/exercises/create-exercise.use-case';
import { DeactivateExerciseUseCase } from '@application/use-cases/exercises/deactivate-exercise.use-case';
import { FindExercisesUseCase } from '@application/use-cases/exercises/find-exercises.use-case';
import { UpdateExerciseUseCase } from '@application/use-cases/exercises/update-exercise.use-case';

export class ExerciseFacade {
  constructor(
    private readonly createExercise: CreateExerciseUseCase,
    private readonly findExercises: FindExercisesUseCase,
    private readonly updateExercise: UpdateExerciseUseCase,
    private readonly deactivateExercise: DeactivateExerciseUseCase,
  ) {}

  create(
    userId: string,
    name: string,
    muscleGroup?: string,
  ): Promise<Exercise> {
    return this.createExercise.execute({ userId, name, muscleGroup });
  }

  find(
    userId: string,
    name?: string,
    muscleGroup?: string,
  ): Promise<Exercise[]> {
    return this.findExercises.execute({ userId, name, muscleGroup });
  }

  update(
    userId: string,
    id: string,
    name?: string,
    muscleGroup?: string | null,
  ): Promise<Exercise> {
    return this.updateExercise.execute({ userId, id, name, muscleGroup });
  }

  deactivate(userId: string, id: string): Promise<Exercise> {
    return this.deactivateExercise.execute({ userId, id });
  }
}
