import { ValidationException } from '../exceptions/domain-exceptions';

export class HashedPassword {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromHash(hash: string): HashedPassword {
    if (!hash) {
      throw new ValidationException('Hashed password cannot be empty');
    }
    return new HashedPassword(hash);
  }

  toString(): string {
    return this.value;
  }
}
