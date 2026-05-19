import { AggregateRoot } from '@domain/entities/aggregate-root';
import { DomainEventBus } from '../events/domain-event-bus';

export abstract class UseCase<TInput, TOutput> {
  private _pendingAggregates: AggregateRoot[] = [];

  constructor(protected readonly eventBus: DomainEventBus) {}

  async execute(input: TInput): Promise<TOutput> {
    this._pendingAggregates = [];
    const result = await this.handle(input);
    await this.publishDomainEvents(result);
    return result;
  }

  protected abstract handle(input: TInput): Promise<TOutput>;

  protected registerAggregate(aggregate: AggregateRoot): void {
    this._pendingAggregates.push(aggregate);
  }

  private async publishDomainEvents(result: TOutput): Promise<void> {
    const fromResult = this.collectAggregates(result);
    const allAggregates = [...this._pendingAggregates, ...fromResult];

    for (const aggregate of allAggregates) {
      for (const event of aggregate.pullDomainEvents()) {
        await this.eventBus.publish(event);
      }
    }
  }

  private collectAggregates(result: unknown): AggregateRoot[] {
    if (result instanceof AggregateRoot) return [result];

    if (Array.isArray(result)) {
      return result.filter(
        (v): v is AggregateRoot => v instanceof AggregateRoot,
      );
    }

    if (result !== null && typeof result === 'object') {
      return Object.values(result).flatMap((value) => {
        if (value instanceof AggregateRoot) {
          return [value];
        }

        if (Array.isArray(value)) {
          return value.filter(
            (v): v is AggregateRoot => v instanceof AggregateRoot,
          );
        }

        return [];
      });
    }

    return [];
  }
}
