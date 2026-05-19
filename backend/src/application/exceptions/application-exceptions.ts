import {
  BaseException,
  ExceptionContext,
  SystemLayer,
} from '../../shared/exceptions/base.exception';

export class ApplicationException extends BaseException {
  constructor(message: string, code: string, context: ExceptionContext = {}) {
    super(message, code, context, SystemLayer.APPLICATION);
  }
}

export class PreconditionException extends ApplicationException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'PRECONDITION_FAILED', context);
  }
}

export class ForbiddenException extends ApplicationException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'FORBIDDEN', context);
  }
}

export class UseCaseTimeoutException extends ApplicationException {
  constructor(
    useCase: string,
    timeoutMs: number,
    context: ExceptionContext = {},
  ) {
    super(
      `Use case "${useCase}" timed out after ${timeoutMs}ms`,
      'USE_CASE_TIMEOUT',
      { useCase, timeoutMs, ...context },
    );
  }
}
