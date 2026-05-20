import { ValidationException } from '../exceptions/domain-exceptions';
import { RegexEmailValidator } from '../validators/email-validator';

export class Email {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Email {
    const canonical = raw.trim().toLowerCase();
    if (!new RegexEmailValidator().validate(canonical)) {
      throw new ValidationException('Invalid email format', { email: raw });
    }
    return new Email(canonical);
  }

  static reconstitute(stored: string): Email {
    return new Email(stored);
  }

  static canonicalize(raw: string): string {
    return raw.trim().toLowerCase();
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
