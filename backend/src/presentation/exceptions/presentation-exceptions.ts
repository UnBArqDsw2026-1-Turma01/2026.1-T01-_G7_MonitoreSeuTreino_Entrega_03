import {
  BaseException,
  ExceptionContext,
  SystemLayer,
} from '@shared/exceptions/base.exception';

export class PresentationException extends BaseException {
  constructor(message: string, code: string, context: ExceptionContext = {}) {
    super(message, code, context, SystemLayer.PRESENTATION);
  }
}

export class RequestValidationException extends PresentationException {
  constructor(
    public readonly errors: { field: string; constraints: string[] }[],
  ) {
    super('Request validation failed', 'VALIDATION', {
      fields: errors.map((e) => e.field),
    });
  }
}

export class MissingHeaderException extends PresentationException {
  constructor(header: string) {
    super(`Missing required header: ${header}`, 'BAD_REQUEST', { header });
  }
}

export class RateLimitException extends PresentationException {
  constructor(retryAfterMs: number) {
    super('Rate limit exceeded', 'RATE_LIMIT', { retryAfterMs });
  }
}
