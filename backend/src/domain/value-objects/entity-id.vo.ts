import { randomUUID } from 'crypto';

export abstract class AggregateId {
  private readonly value: `${string}-${string}-${string}-${string}-${string}`;

  protected constructor(value?: string) {
    if (value === undefined) {
      this.value = randomUUID();
      return;
    }

    if (!AggregateId.isValid(value)) {
      throw new Error(
        `${this.constructor.name} invalid: "${value}" is not a valid UUID.`,
      );
    }
    this.value = value as `${string}-${string}-${string}-${string}-${string}`;
  }

  static isValid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    );
  }

  toString(): string {
    return this.value;
  }

  equals(other: AggregateId): boolean {
    return this.value === other.value;
  }
}
