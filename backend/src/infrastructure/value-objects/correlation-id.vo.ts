import { AggregateId } from '@domain/value-objects/entity-id.vo';
import * as crypto from 'node:crypto';

export class CorrelationId {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static generate(): CorrelationId {
    return new CorrelationId(crypto.randomUUID());
  }

  static fromHeader(raw: string | undefined): CorrelationId {
    if (raw && AggregateId.isValid(raw)) {
      return new CorrelationId(raw);
    }
    return CorrelationId.generate();
  }

  toString(): string {
    return this.value;
  }
}
