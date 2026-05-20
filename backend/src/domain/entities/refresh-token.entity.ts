import { SessionInvalidatedEvent } from '../events/refresh-token-events';
import { UnauthorizedException } from '../exceptions/domain-exceptions';
import { ExpiresAt } from '../value-objects/expires-at.vo';
import { RefreshTokenId } from '../value-objects/refresh-token-id.vo';
import { Timestamp } from '../value-objects/timestamp.vo';
import { TokenHash } from '../value-objects/token-hash.vo';
import { UserId } from '../value-objects/user-id.vo';
import { AggregateRoot } from './aggregate-root';

export class RefreshToken extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: TokenHash,
    public readonly expiresAt: ExpiresAt,
    public readonly createdAt: Timestamp,
    public readonly revokedAt: Timestamp | null = null,
  ) {
    super();
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /*
   * Usado para criação de novos tokens, gerando eventos de registro de sessão
   * (não implementado aqui, mas poderia ser adicionado)
   */

  static create(
    userId: string,
    tokenHash: TokenHash,
    expiresAt: ExpiresAt,
  ): RefreshToken {
    UserId.reconstitute(userId);
    return new RefreshToken(
      RefreshTokenId.create().toString(),
      userId,
      tokenHash,
      expiresAt,
      Timestamp.now(),
    );
  }

  // Usado para reconstituição a partir de dados persistidos, sem gerar eventos

  static reconstitute(
    id: string,
    userId: string,
    tokenHash: TokenHash,
    expiresAt: ExpiresAt,
    createdAt: Timestamp,
    revokedAt: Timestamp | null,
  ): RefreshToken {
    return new RefreshToken(
      id,
      userId,
      tokenHash,
      expiresAt,
      createdAt,
      revokedAt,
    );
  }

  // ─── Mutação (imutável) ───────────────────────────────────────────────────

  // Permite invalidar o token, gerando evento de invalidação de sessão

  invalidate(): RefreshToken {
    if (this.hasBeenRevoked()) {
      throw new UnauthorizedException('Refresh token already revoked', {
        tokenId: this.id,
        userId: this.userId,
      });
    }

    const now = Timestamp.now();
    const invalidated = new RefreshToken(
      this.id,
      this.userId,
      this.tokenHash,
      this.expiresAt,
      this.createdAt,
      now,
    );
    invalidated.pushEvent(
      new SessionInvalidatedEvent(this.id, this.userId, now.toDate()),
    );
    return invalidated;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  // Permite verificar o estado do token

  hasExpired(): boolean {
    return this.expiresAt.hasExpired();
  }

  // Permite verificar se o token foi revogado

  hasBeenRevoked(): boolean {
    return this.revokedAt !== null;
  }

  // Permite verificar se o token está ativo (não expirado e não revogado)

  isActive(): boolean {
    return !this.hasExpired() && !this.hasBeenRevoked();
  }
}
