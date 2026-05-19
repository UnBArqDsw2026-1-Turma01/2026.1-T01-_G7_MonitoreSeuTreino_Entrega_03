import { DomainEvent } from './domain-event';

// Evento disparado quando uma rotina é criada do zero
export class RoutineCreatedEvent implements DomainEvent {
  constructor(
    public readonly routineId: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}

// Evento disparado quando o Prototype entra em ação (clonagem)
export class RoutineClonedEvent implements DomainEvent {
  constructor(
    public readonly originalRoutineId: string,
    public readonly newRoutineId: string,
    public readonly userId: string,
    public readonly occurredAt: Date = new Date(),
  ) {}
}