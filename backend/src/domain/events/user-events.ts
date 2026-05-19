import { DomainEvent } from './domain-event';

export class UserRegisteredEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date,
  ) {}
}

export class UserUpdatedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}

export class UserPasswordChangedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}

export class UserDeactivatedEvent implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly occurredAt: Date,
  ) {}
}
