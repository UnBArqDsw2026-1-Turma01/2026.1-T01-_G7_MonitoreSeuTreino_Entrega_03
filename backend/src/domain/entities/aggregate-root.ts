import { DomainEvent } from '../events/domain-event';

export abstract class AggregateRoot {
  private _domainEvents: DomainEvent[] = [];

  protected pushEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  protected mergeEventsFrom(source: AggregateRoot): void {
    for (const event of source.pullDomainEvents()) {
      this.pushEvent(event);
    }
  }
}
