import {
  BaseException,
  ExceptionContext,
  SystemLayer,
} from '@shared/exceptions/base.exception';

export class InfrastructureException extends BaseException {
  constructor(
    message: string,
    cause: unknown,
    code: string = 'INFRASTRUCTURE_ERROR',
    context: ExceptionContext = {},
  ) {
    super(message, code, context, SystemLayer.INFRASTRUCTURE);
    Object.defineProperty(this, 'cause', { value: cause, enumerable: true });
  }

  override toLog(): Record<string, unknown> {
    const cause: unknown = Reflect.get(this, 'cause');
    return {
      ...super.toLog(),
      cause: {
        message: cause instanceof Error ? cause.message : cause,
        stack: cause instanceof Error ? cause.stack : undefined,
      },
    };
  }
}

export class DatabaseException extends InfrastructureException {
  constructor(
    operation: string,
    cause: unknown,
    context: ExceptionContext = {},
  ) {
    super(`Database operation failed: ${operation}`, cause, 'DATABASE_ERROR', {
      operation,
      ...context,
    });
  }
}

export class ExternalServiceException extends InfrastructureException {
  constructor(service: string, cause: unknown, context: ExceptionContext = {}) {
    super(
      `External service "${service}" is unavailable`,
      cause,
      'EXTERNAL_SERVICE_ERROR',
      { service, ...context },
    );
  }
}

type TokenFailureReason = 'expired' | 'invalid' | 'malformed';

const TOKEN_CODE: Record<TokenFailureReason, string> = {
  expired: 'TOKEN_EXPIRED',
  invalid: 'UNAUTHORIZED',
  malformed: 'UNAUTHORIZED',
};

export class TokenException extends InfrastructureException {
  constructor(
    public readonly reason: TokenFailureReason,
    cause: unknown,
    context: ExceptionContext = {},
  ) {
    super(`Token ${reason}`, cause, TOKEN_CODE[reason], { reason, ...context });
  }
}
