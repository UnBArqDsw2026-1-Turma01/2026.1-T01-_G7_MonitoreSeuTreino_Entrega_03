export interface EmailValidatorStrategy {
  validate(email: string): boolean;
}

export class RegexEmailValidator implements EmailValidatorStrategy {
  validate(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
