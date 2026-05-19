import { DomainException } from '@domain/exceptions/domain-exceptions';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { catchError, Observable, tap, throwError } from 'rxjs';

const DOMAIN_STATUS: Record<string, number> = {
  CONFLICT: 409,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  TOKEN_EXPIRED: 401,
  VALIDATION: 400,
  INFRASTRUCTURE_ERROR: 500,
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    const meta = {
      context: 'HTTP',
      correlationId: req.correlationId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    this.logger.log('Request received', meta as any);

    return next.handle().pipe(
      tap(() => {
        this.logger.log('Response sent', {
          ...meta,
          statusCode: res.statusCode,
          durationMs: Date.now() - startTime,
        } as any);
      }),
      catchError((err: unknown) => {
        const statusCode = this.resolveStatus(err);

        this.logger.error('Request failed', {
          ...meta,
          statusCode,
          durationMs: Date.now() - startTime,
          error: err instanceof Error ? err.message : err,
          stack: err instanceof Error ? err.stack : undefined,
        } as any);

        return throwError(() => err);
      }),
    );
  }

  private resolveStatus(err: unknown): number {
    if (err instanceof DomainException) {
      return DOMAIN_STATUS[err.code] ?? 400;
    }
    // HttpException do NestJS tem .status
    if (err && typeof err === 'object' && 'status' in err) {
      return (err as { status: number }).status;
    }
    return 500;
  }
}
