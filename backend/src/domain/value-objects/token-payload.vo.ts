import { ValidationException } from '../exceptions/domain-exceptions';
import { AggregateId } from './entity-id.vo';

export class TokenPayload {
  readonly userId: string;
  readonly email: string;

  private constructor(userId: string, email: string) {
    this.userId = userId;
    this.email = email;
  }

  static create(userId: string, email: string): TokenPayload {
    if (!AggregateId.isValid(userId)) {
      throw new ValidationException('Invalid userId in token payload', {
        userId,
      });
    }
    if (!email) {
      throw new ValidationException('Email cannot be empty in token payload');
    }
    return new TokenPayload(userId, email);
  }
}
