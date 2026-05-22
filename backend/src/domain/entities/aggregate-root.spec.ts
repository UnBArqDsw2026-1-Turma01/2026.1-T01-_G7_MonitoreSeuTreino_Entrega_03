import { DomainEvent } from '../events/domain-event';
import { AggregateRoot } from './aggregate-root';

class DummyEventA implements DomainEvent {
  public readonly occurredAt: Date = new Date();
}
class DummyEventB implements DomainEvent {
  public readonly occurredAt: Date = new Date();
}

class ConcreteAggregate extends AggregateRoot {
  triggerA() {
    this.pushEvent(new DummyEventA());
  }
  triggerB() {
    this.pushEvent(new DummyEventB());
  }
  merge(other: AggregateRoot) {
    this.mergeEventsFrom(other);
  }
}

describe('AggregateRoot (Observer Emissor)', () => {
  it('✓ deve acumular eventos gerados internamente', () => {
    const agg = new ConcreteAggregate();
    agg.triggerA();
    agg.triggerB();

    const events = agg.pullDomainEvents();

    expect(events).toHaveLength(2);
    expect(events[0]).toBeInstanceOf(DummyEventA);
    expect(events[1]).toBeInstanceOf(DummyEventB);
  });

  it('✓ deve esvaziar a lista de eventos pendentes após a coleta (pullDomainEvents)', () => {
    const agg = new ConcreteAggregate();
    agg.triggerA();

    agg.pullDomainEvents(); // Primeira coleta drena os eventos
    const eventsAfterFirstPull = agg.pullDomainEvents(); // Segunda tentativa

    expect(eventsAfterFirstPull).toHaveLength(0); // Garante que não publica duplicado
  });

  it('✓ deve mesclar eventos de outro agregado (mergeEventsFrom) transferindo o estado imutável', () => {
    const aggOld = new ConcreteAggregate();
    aggOld.triggerA(); // O antigo gerou o evento A

    const aggNew = new ConcreteAggregate();
    aggNew.triggerB(); // O novo gerou o evento B

    // Simula uma mutação imutável onde o estado do antigo é passado para o novo
    aggNew.merge(aggOld);

    const mergedEvents = aggNew.pullDomainEvents();

    expect(mergedEvents).toHaveLength(2);

    // O agregado antigo deve ter ficado vazio após o merge
    expect(aggOld.pullDomainEvents()).toHaveLength(0);
  });
});
