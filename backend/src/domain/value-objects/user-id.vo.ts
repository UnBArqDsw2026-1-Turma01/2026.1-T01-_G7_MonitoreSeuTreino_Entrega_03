import { AggregateId } from './entity-id.vo';

export class UserId extends AggregateId {
  private constructor(value?: string) {
    super(value);
  }
  static create(): UserId {
    return new UserId();
  }
  static reconstitute(value: string): UserId {
    return new UserId(value);
  }
}
