import { NotFoundException } from '@domain/exceptions/domain-exceptions';
import { Exercise } from '@domain/exercises/entities/exercise.entity';
import { ExerciseRepository } from '@domain/exercises/repositories/exercise.repository';

export interface DeactivateExerciseCommand {
  userId: string;
  id: string;
}

export class DeactivateExerciseUseCase {
  constructor(private readonly exerciseRepository: ExerciseRepository) {}

  async execute(command: DeactivateExerciseCommand): Promise<Exercise> {
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

    const deactivated = exercise.deactivate();
    await this.exerciseRepository.update(deactivated);
    return deactivated;
  }
}