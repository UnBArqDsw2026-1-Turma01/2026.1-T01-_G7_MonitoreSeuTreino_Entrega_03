import { DomainEvent } from '@domain/events/domain-event';
import { AppLogger } from '../logger/logger.interface';

type EventHandler = (event: DomainEvent) => Promise<void>;

export class DomainEventBus {
  private readonly handlers = new Map<string, EventHandler[]>();

  constructor(private readonly logger: AppLogger) {}

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) ?? [];

    const results = await Promise.allSettled(
      handlers.map((handler) => handler(event)),
    );

    results
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .forEach((r) => {
        const errorMessage =
          r.reason instanceof Error ? r.reason.message : String(r.reason);
        console.error(
          `[DomainEventBus] Falha ao processar evento ${eventName}:`,
          errorMessage,
        );
      });
  }
}
