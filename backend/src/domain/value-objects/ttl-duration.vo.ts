import { ValidationException } from '../exceptions/domain-exceptions';
import { ExpiresAt } from './expires-at.vo';

export class TtlDuration {
  private readonly ms: number;

  private constructor(ms: number) {
    this.ms = ms;
  }

  static fromDays(days: number): TtlDuration {
    if (!Number.isFinite(days) || days < 1 || days > 90) {
      throw new ValidationException('Refresh token TTL must be 1–90 days', {
        days,
      });
    }
    return new TtlDuration(days * 24 * 60 * 60 * 1000);
  }

  toMs(): number {
    return this.ms;
  }

  toExpiresAt(): ExpiresAt {
    return ExpiresAt.fromTtlMs(this.ms);
  }
}
