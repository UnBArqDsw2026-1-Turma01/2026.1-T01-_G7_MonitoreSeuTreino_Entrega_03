import { ValidationException } from '../exceptions/domain-exceptions';

export class TokenHash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static from(hash: string): TokenHash {
    if (!hash || hash.trim().length === 0) {
      throw new ValidationException('Token hash cannot be empty');
    }
    return new TokenHash(hash);
  }

  equals(other: TokenHash): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
