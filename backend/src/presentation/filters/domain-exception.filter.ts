import { BaseException } from '@shared/exceptions/base.exception';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Inject,
  type LoggerService,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Catch(BaseException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  private static readonly STATUS_MAP: Record<string, number> = {
    CONFLICT: HttpStatus.CONFLICT,
    NOT_FOUND: HttpStatus.NOT_FOUND,
    UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
    TOKEN_EXPIRED: HttpStatus.UNAUTHORIZED,
    VALIDATION: HttpStatus.BAD_REQUEST,
    FORBIDDEN: HttpStatus.FORBIDDEN,
    INFRASTRUCTURE_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
  };

  catch(exception: BaseException, host: ArgumentsHost): void {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();
    const status =
      DomainExceptionFilter.STATUS_MAP[exception.code] ??
      HttpStatus.BAD_REQUEST;

    this.logger.error('Exception caught', {
      context: 'ExceptionFilter',
      correlationId: req.correlationId,
      errorName: exception.name,
      errorCode: exception.code,
      message: exception.message,
      layer: exception.layer,
      occurredAt: exception.occurredAt,
      errorContext: exception.context,
      cause: (() => {
        if (!(exception instanceof InfrastructureException)) {
          return undefined;
        }

        const cause = (
          exception as InfrastructureException & {
            cause?: unknown;
          }
        ).cause;

        return {
          message: cause instanceof Error ? cause.message : cause,
          stack: cause instanceof Error ? cause.stack : undefined,
        };
      })(),
      stack: exception.stack,
      http: { method: req.method, path: req.path, status },
    });

    res.status(status).json({
      error: exception.code,
      message: status >= 500 ? 'Internal server error' : exception.message,
      correlationId: req.correlationId,
    });
  }
}
