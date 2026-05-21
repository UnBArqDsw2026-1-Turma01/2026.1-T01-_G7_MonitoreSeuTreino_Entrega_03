import { PasswordResetToken } from '@domain/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { ExpiresAt } from '@domain/value-objects/expires-at.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokenOrmEntity } from './password-reset-token.orm-entity';

@Injectable()
export class PasswordResetTokenPostgresRepository
  implements PasswordResetTokenRepository
{
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly repository: Repository<PasswordResetTokenOrmEntity>,
  ) {}

  private toDomain(orm: PasswordResetTokenOrmEntity): PasswordResetToken {
    return PasswordResetToken.reconstitute(
      orm.id,
      orm.userId,
      TokenHash.from(orm.tokenHash),
      ExpiresAt.reconstitute(orm.expiresAt),
      Timestamp.from(orm.createdAt),
      orm.usedAt ? Timestamp.from(orm.usedAt) : null,
    );
  }

  async save(token: PasswordResetToken): Promise<void> {
    try {
      await this.repository.save({
        id: token.id,
        userId: token.userId,
        tokenHash: token.tokenHash.toString(),
        expiresAt: token.expiresAt.toDate(),
        usedAt: token.usedAt?.toDate() ?? null,
        createdAt: token.createdAt.toDate(),
      });
    } catch (err) {
      throw new InfrastructureException(
        'Failed to save password reset token',
        err,
        `method=save userId=${token.userId}`,
      );
    }
  }

  async findByTokenHash(hash: TokenHash): Promise<PasswordResetToken | null> {
    try {
      const found = await this.repository.findOneBy({
        tokenHash: hash.toString(),
      });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find password reset token by hash',
        err,
        'method=findByTokenHash',
      );
    }
  }

  async deleteByUserId(userId: string): Promise<void> {
    try {
      await this.repository.delete({ userId });
    } catch (err) {
      throw new InfrastructureException(
        'Failed to delete password reset tokens for user',
        err,
        `method=deleteByUserId userId=${userId}`,
      );
    }
  }
}
