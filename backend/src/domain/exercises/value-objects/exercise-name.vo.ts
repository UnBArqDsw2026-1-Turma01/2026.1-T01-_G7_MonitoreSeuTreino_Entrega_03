import { ValidationException } from '@domain/exceptions/domain-exceptions';

export class ExerciseName {
  private constructor(private readonly value: string) {}

  static create(raw: string): ExerciseName {
    const trimmed = raw.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
      throw new ValidationException('Exercise name must be 2–100 characters', {
        name: raw,
      });
    }

    return new ExerciseName(trimmed);
  }

  static reconstitute(stored: string): ExerciseName {
    return new ExerciseName(stored);
  }

  toString(): string {
    return this.value;
  }
}
