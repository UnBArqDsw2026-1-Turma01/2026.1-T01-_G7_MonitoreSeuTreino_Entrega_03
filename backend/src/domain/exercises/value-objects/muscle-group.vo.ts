import { ValidationException } from '@domain/exceptions/domain-exceptions';

export class MuscleGroup {
  private constructor(private readonly value: string) {}

  static create(raw: string): MuscleGroup {
    const trimmed = raw.trim();

    if (trimmed.length < 2 || trimmed.length > 100) {
      throw new ValidationException(
        'Muscle group must be 2–100 characters',
        { muscleGroup: raw },
      );
    }

    return new MuscleGroup(trimmed);
  }

  static reconstitute(stored: string): MuscleGroup {
    return new MuscleGroup(stored);
  }

  toString(): string {
    return this.value;
  }
}