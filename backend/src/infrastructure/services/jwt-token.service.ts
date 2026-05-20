import {
  DomainException,
  UnauthorizedException,
} from '@domain/exceptions/domain-exceptions';
import { TokenService } from '@domain/services/token.service';
import { AccessToken } from '@domain/value-objects/access-token.vo';
import { OpaqueToken } from '@domain/value-objects/opaque-token.vo';
import { TokenPayload } from '@domain/value-objects/token-payload.vo';
import { TtlDuration } from '@domain/value-objects/ttl-duration.vo';
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtTokenService implements TokenService {
  private readonly accessTokenSecret: string;
  private readonly ttl: TtlDuration;

  constructor() {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error('JWT secrets not configured: set JWT_ACCESS_SECRET');
    }
    this.accessTokenSecret = accessSecret;

    const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS ?? 7);
    this.ttl = TtlDuration.fromDays(days);
  }

  generateAccessToken(payload: TokenPayload): AccessToken {
    const token = jwt.sign(
      { userId: payload.userId, email: payload.email },
      this.accessTokenSecret,
      { expiresIn: '15m' },
    );
    return AccessToken.fromJwt(token);
  }

  generateOpaqueToken(): OpaqueToken {
    return OpaqueToken.generate();
  }

  // TODO: Colocar erros personalizados para token expirado e token inválido
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as {
        userId: string;
        email: string;
      };
      return TokenPayload.create(decoded.userId, decoded.email);
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        throw new DomainException('Token expired', 'TOKEN_EXPIRED');
      }
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw err;
    }
  }

  getRefreshTokenTtl(): TtlDuration {
    return this.ttl;
  }
}
