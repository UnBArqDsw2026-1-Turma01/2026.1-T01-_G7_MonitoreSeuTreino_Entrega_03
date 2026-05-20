export class AccessToken {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromJwt(jwt: string): AccessToken {
    return new AccessToken(jwt);
  }

  toString(): string {
    return this.value;
  }
}
