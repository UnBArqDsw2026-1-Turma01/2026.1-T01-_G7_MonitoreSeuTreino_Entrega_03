import {
  NotFoundException,
  ValidationException,
} from '@domain/exceptions/domain-exceptions';
import { Exercise } from '@domain/exercises/entities/exercise.entity';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';
import { ExerciseName } from '@domain/exercises/value-objects/exercise-name.vo';
import { MuscleGroup } from '@domain/exercises/value-objects/muscle-group.vo';

export interface UpdateExerciseCommand {
  userId: string;
  id: string;
  name?: string;
  muscleGroup?: string | null;
}

export class UpdateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(command: UpdateExerciseCommand): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findByIdAndUserId(
      command.id,
      command.userId,
    );

    if (!exercise) {
      throw new NotFoundException('Exercise not found', {
        exerciseId: command.id,
        userId: command.userId,
      });
    }

    const hasName = typeof command.name === 'string';
    const hasMuscleGroup = command.muscleGroup !== undefined;

    if (!hasName && !hasMuscleGroup) {
      throw new ValidationException('At least one field must be provided');
    }

    const name = hasName ? ExerciseName.create(command.name!) : undefined;
    const muscleGroup =
      command.muscleGroup === undefined
        ? undefined
        : command.muscleGroup === null
          ? null
          : MuscleGroup.create(command.muscleGroup);

    const updated = exercise.changeDetails(name, muscleGroup);
    await this.exerciseRepository.update(updated);
    return updated;
  }
}
