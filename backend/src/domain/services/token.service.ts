import { AccessToken } from '../value-objects/access-token.vo';
import { OpaqueToken } from '../value-objects/opaque-token.vo';
import { TokenPayload } from '../value-objects/token-payload.vo';
import { TtlDuration } from '../value-objects/ttl-duration.vo';

export interface TokenService {
  generateAccessToken(payload: TokenPayload): AccessToken;
  generateOpaqueToken(): OpaqueToken;
  verifyAccessToken(token: string): TokenPayload;
  getRefreshTokenTtl(): TtlDuration;
}

export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');
