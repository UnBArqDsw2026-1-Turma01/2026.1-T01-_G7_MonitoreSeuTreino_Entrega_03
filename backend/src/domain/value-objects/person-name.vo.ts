import { ValidationException } from '../exceptions/domain-exceptions';

export class PersonName {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): PersonName {
    const trimmed = raw.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      throw new ValidationException('Name must be 2–100 characters', {
        name: raw,
      });
    }
    return new PersonName(trimmed);
  }

  static reconstitute(stored: string): PersonName {
    return new PersonName(stored);
  }

  toString(): string {
    return this.value;
  }
}
