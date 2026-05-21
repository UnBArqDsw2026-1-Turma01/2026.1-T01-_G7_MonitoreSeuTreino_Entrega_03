import { ValidationException } from '@domain/exceptions/domain-exceptions';
import { Exercise } from '../entities/exercise.entity';
import { MuscleGroup } from '../value-objects/muscle-group.vo';
import { ExerciseName } from '../value-objects/exercise-name.vo';

export class ExerciseBuilder {
  private userId?: string;
  private name?: string;
  private muscleGroup: string | null = null;

  withUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  withName(name: string): this {
    this.name = name;
    return this;
  }

  withMuscleGroup(muscleGroup?: string | null): this {
    this.muscleGroup = muscleGroup ?? null;
    return this;
  }

  build(): Exercise {
    if (!this.userId) {
      throw new ValidationException('Exercise user is required');
    }

    if (!this.name) {
      throw new ValidationException('Exercise name is required');
    }

    const exerciseName = ExerciseName.create(this.name);
    const muscleGroup =
      this.muscleGroup === null ? null : MuscleGroup.create(this.muscleGroup);

    return Exercise.create(this.userId, exerciseName, muscleGroup);
  }
}