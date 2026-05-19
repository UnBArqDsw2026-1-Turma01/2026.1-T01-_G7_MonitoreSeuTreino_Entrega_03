import {
  BaseException,
  ExceptionContext,
  SystemLayer,
} from '../../shared/exceptions/base.exception';

export class DomainException extends BaseException {
  constructor(message: string, code: string, context: ExceptionContext = {}) {
    super(message, code, context, SystemLayer.DOMAIN);
  }
}

export class ConflictException extends DomainException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'CONFLICT', context);
  }
}

export class NotFoundException extends DomainException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'NOT_FOUND', context);
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'UNAUTHORIZED', context);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string, context: ExceptionContext = {}) {
    super(message, 'VALIDATION', context);
  }
}

export class BusinessRuleException extends DomainException {
  constructor(
    message: string,
    public readonly rule: string,
    context: ExceptionContext = {},
  ) {
    super(message, 'BUSINESS_RULE', { rule, ...context });
  }
}
