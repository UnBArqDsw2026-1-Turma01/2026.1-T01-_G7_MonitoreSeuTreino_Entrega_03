import { ValidationException } from '../exceptions/domain-exceptions';

export class ExpiresAt {
  private readonly value: Date;

  private constructor(value: Date) {
    this.value = new Date(value);
  }

  static fromTtlMs(ttlMs: number): ExpiresAt {
    if (ttlMs <= 0) {
      throw new ValidationException('TTL must be a positive number', { ttlMs });
    }
    return new ExpiresAt(new Date(Date.now() + ttlMs));
  }

  static reconstitute(date: Date): ExpiresAt {
    return new ExpiresAt(date);
  }

  hasExpired(): boolean {
    return new Date() > this.value;
  }

  toDate(): Date {
    return new Date(this.value);
  }
}
