import { ValidationException } from '../exceptions/domain-exceptions';

export class PlainPassword {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): PlainPassword {
    if (raw.length < 8 || raw.length > 64) {
      throw new ValidationException('Password must be 8–64 characters');
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(raw)) {
      throw new ValidationException(
        'Password must contain uppercase, lowercase, number and special character',
      );
    }
    return new PlainPassword(raw);
  }

  static reconstitute(raw: string): PlainPassword {
    return new PlainPassword(raw);
  }

  toString(): string {
    return this.value;
  }
}
