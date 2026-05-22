import {
  PasswordResetCompletedEvent,
  PasswordResetRequestedEvent,
} from '../events/user-events';
import { ExpiresAt } from '../value-objects/expires-at.vo';
import { Timestamp } from '../value-objects/timestamp.vo';
import { TokenHash } from '../value-objects/token-hash.vo';
import { AggregateRoot } from './aggregate-root';

export class PasswordResetToken extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: TokenHash,
    public readonly expiresAt: ExpiresAt,
    public readonly createdAt: Timestamp,
    public readonly usedAt: Timestamp | null = null,
  ) {
    super();
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  static create(
    userId: string,
    tokenHash: TokenHash,
    expiresAt: ExpiresAt,
  ): PasswordResetToken {
    const now = Timestamp.now();
    const token = new PasswordResetToken(
      crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      now,
    );
    token.pushEvent(new PasswordResetRequestedEvent(userId, now.toDate()));
    return token;
  }

  static reconstitute(
    id: string,
    userId: string,
    tokenHash: TokenHash,
    expiresAt: ExpiresAt,
    createdAt: Timestamp,
    usedAt: Timestamp | null,
  ): PasswordResetToken {
    return new PasswordResetToken(
      id,
      userId,
      tokenHash,
      expiresAt,
      createdAt,
      usedAt,
    );
  }

  // ─── Mutation (immutable — returns new instance) ──────────────────────────

  markAsUsed(): PasswordResetToken {
    const now = Timestamp.now();
    const updated = new PasswordResetToken(
      this.id,
      this.userId,
      this.tokenHash,
      this.expiresAt,
      this.createdAt,
      now,
    );
    updated.pushEvent(
      new PasswordResetCompletedEvent(this.userId, now.toDate()),
    );
    return updated;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  isExpired(): boolean {
    return this.expiresAt.hasExpired();
  }

  isUsed(): boolean {
    return this.usedAt !== null;
  }
}
