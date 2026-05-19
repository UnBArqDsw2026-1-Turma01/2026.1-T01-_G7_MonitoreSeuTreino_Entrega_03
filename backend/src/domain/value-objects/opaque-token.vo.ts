import * as crypto from 'node:crypto';

export class OpaqueToken {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static generate(): OpaqueToken {
    return new OpaqueToken(crypto.randomBytes(64).toString('hex'));
  }

  toString(): string {
    return this.value;
  }
}
