import { AggregateId } from './entity-id.vo';

export class RoutineId extends AggregateId {
  private constructor(value?: string) {
    super(value);
  }

  static create(): RoutineId {
    return new RoutineId();
  }

  static fromString(id: string): RoutineId {
    return new RoutineId(id);
  }
}