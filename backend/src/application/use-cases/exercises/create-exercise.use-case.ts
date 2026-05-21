import { ExerciseBuilder } from '@domain/exercises/builders/exercise.builder';
import { Exercise } from '@domain/exercises/entities/exercise.entity';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export interface CreateExerciseCommand {
  userId: string;
  name: string;
  muscleGroup?: string;
}

export class CreateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(command: CreateExerciseCommand): Promise<Exercise> {
    const exercise = new ExerciseBuilder()
      .withUserId(command.userId)
      .withName(command.name)
      .withMuscleGroup(command.muscleGroup)
      .build();

    await this.exerciseRepository.save(exercise);
    return exercise;
  }
}
