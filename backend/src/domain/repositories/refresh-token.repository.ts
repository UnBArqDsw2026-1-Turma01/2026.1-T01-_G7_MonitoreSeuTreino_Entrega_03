import { RefreshToken } from '../entities/refresh-token.entity';
import { TokenHash } from '../value-objects/token-hash.vo';

export interface RefreshTokenRepository {
  insert(token: RefreshToken): Promise<void>;
  update(token: RefreshToken): Promise<void>;
  findByHash(hash: TokenHash): Promise<RefreshToken | null>;
  revokeAllByUserId(userId: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
