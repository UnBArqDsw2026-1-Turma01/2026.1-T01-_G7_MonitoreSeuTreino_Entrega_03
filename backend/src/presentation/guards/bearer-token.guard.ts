import { DomainException } from '@domain/exceptions/domain-exceptions';
import {
  TOKEN_SERVICE,
  type TokenService,
} from '@domain/services/token.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      request.user = this.tokenService.verifyAccessToken(token);
      return true;
    } catch (err) {
      const message =
        err instanceof DomainException
          ? err.message
          : 'Invalid or expired token';
      throw new UnauthorizedException(message);
    }
  }
}
