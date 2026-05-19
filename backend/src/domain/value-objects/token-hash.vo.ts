import { ValidationException } from '../exceptions/domain-exceptions';

export class TokenHash {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static from(hash: string): TokenHash {
    if (!hash || !/^[0-9a-f]+$/i.test(hash)) {
      throw new ValidationException('Invalid token hash format');
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
