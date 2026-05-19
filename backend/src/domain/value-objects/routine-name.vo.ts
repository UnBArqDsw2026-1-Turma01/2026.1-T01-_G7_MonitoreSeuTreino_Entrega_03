import { ValidationException } from '../exceptions/domain-exceptions';

export class RoutineName {
  private constructor(public readonly value: string) {}

  static create(value: string): RoutineName {
    const trimmed = value.trim();
    if (trimmed.length < 3) {
      throw new ValidationException('Routine name must be at least 3 characters long');
    }
    return new RoutineName(trimmed);
  }

  toString(): string {
    return this.value;
  }
}