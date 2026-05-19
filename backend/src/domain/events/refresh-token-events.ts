import { DomainEvent } from './domain-event';

export class SessionInvalidatedEvent implements DomainEvent {
  constructor(
    public readonly tokenId: string,
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}

export class AllSessionsRevokedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}
