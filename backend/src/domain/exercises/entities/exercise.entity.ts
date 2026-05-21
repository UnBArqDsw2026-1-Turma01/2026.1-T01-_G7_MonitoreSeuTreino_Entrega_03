import { randomUUID } from 'crypto';
import { MuscleGroup } from '../value-objects/muscle-group.vo';
import { ExerciseName } from '../value-objects/exercise-name.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';

export class Exercise {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: ExerciseName,
    public readonly muscleGroup: MuscleGroup | null,
    public readonly active: boolean,
    public readonly createdAt: Timestamp,
    public readonly updatedAt: Timestamp,
    public readonly deactivatedAt: Timestamp | null,
  ) {}

  static create(
    userId: string,
    name: ExerciseName,
    muscleGroup: MuscleGroup | null,
  ): Exercise {
    const now = Timestamp.now();

    return new Exercise(
      randomUUID(),
      userId,
      name,
      muscleGroup,
      true,
      now,
      now,
      null,
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    name: ExerciseName,
    muscleGroup: MuscleGroup | null,
    active: boolean,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    deactivatedAt: Timestamp | null,
  ): Exercise {
    return new Exercise(
      id,
      userId,
      name,
      muscleGroup,
      active,
      createdAt,
      updatedAt,
      deactivatedAt,
    );
  }

  changeDetails(
    name?: ExerciseName,
    muscleGroup?: MuscleGroup | null,
  ): Exercise {
    if (!name && muscleGroup === undefined) {
      return this;
    }

    const now = Timestamp.now();

    return new Exercise(
      this.id,
      this.userId,
      name ?? this.name,
      muscleGroup === undefined ? this.muscleGroup : muscleGroup,
      this.active,
      this.createdAt,
      now,
      this.deactivatedAt,
    );
  }

  deactivate(): Exercise {
    if (!this.active) {
      return this;
    }

    const now = Timestamp.now();

    return new Exercise(
      this.id,
      this.userId,
      this.name,
      this.muscleGroup,
      false,
      this.createdAt,
      now,
      now,
    );
  }

  isOwnedBy(userId: string): boolean {
    return this.userId === userId;
  }

  isInactive(): boolean {
    return !this.active;
  }
}
