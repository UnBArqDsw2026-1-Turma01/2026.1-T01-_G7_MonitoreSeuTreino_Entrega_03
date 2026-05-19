import { RefreshToken } from '@domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { ExpiresAt } from '@domain/value-objects/expires-at.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import { RefreshTokenOrmEntity } from '@infrastructure/database/refresh-token.orm-entity';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class RefreshTokenPostgresRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repository: Repository<RefreshTokenOrmEntity>,
  ) {}

  private toDomain(orm: RefreshTokenOrmEntity): RefreshToken {
    return RefreshToken.reconstitute(
      orm.id,
      orm.userId,
      TokenHash.from(orm.tokenHash),
      ExpiresAt.reconstitute(orm.expiresAt),
      Timestamp.from(orm.createdAt),
      orm.revokedAt ? Timestamp.from(orm.revokedAt) : null,
    );
  }

  async insert(token: RefreshToken): Promise<void> {
    try {
      await this.repository.insert({
        id: token.id,
        userId: token.userId,
        tokenHash: token.tokenHash.toString(),
        expiresAt: token.expiresAt.toDate(),
        createdAt: token.createdAt.toDate(),
        revokedAt: token.revokedAt?.toDate() ?? null,
      });
    } catch (err) {
      throw new InfrastructureException(
        'Failed to insert refresh token',
        err,
        JSON.stringify({ method: 'insert', userId: token.userId }),
      );
    }
  }

  async update(token: RefreshToken): Promise<void> {
    try {
      await this.repository.update(
        { id: token.id },
        { revokedAt: token.revokedAt?.toDate() ?? null },
      );
    } catch (err) {
      throw new InfrastructureException(
        'Failed to update refresh token',
        err,
        JSON.stringify({ method: 'update', tokenId: token.id }),
      );
    }
  }

  async findByHash(hash: TokenHash): Promise<RefreshToken | null> {
    try {
      const found = await this.repository.findOneBy({
        tokenHash: hash.toString(),
      });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find refresh token',
        err,
        JSON.stringify({ method: 'findByHash' }),
      );
    }
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    try {
      await this.repository.update(
        { userId, revokedAt: IsNull() },
        { revokedAt: new Date() },
      );
    } catch (err) {
      throw new InfrastructureException(
        'Failed to revoke user tokens',
        err,
        JSON.stringify({ method: 'revokeAllByUserId', userId }),
      );
    }
  }
}
