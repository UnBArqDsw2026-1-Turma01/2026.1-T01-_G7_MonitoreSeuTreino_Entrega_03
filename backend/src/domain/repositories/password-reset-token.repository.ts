import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { TokenHash } from '../value-objects/token-hash.vo';

export interface PasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findByTokenHash(hash: TokenHash): Promise<PasswordResetToken | null>;
  deleteByUserId(userId: string): Promise<void>;
}

export const PASSWORD_RESET_TOKEN_REPOSITORY = Symbol(
  'PASSWORD_RESET_TOKEN_REPOSITORY',
);
