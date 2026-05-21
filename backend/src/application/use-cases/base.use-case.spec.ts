import { AggregateRoot } from '../../domain/entities/aggregate-root';
import { DomainEvent } from '../../domain/events/domain-event';
import { DomainEventBus } from '../events/domain-event-bus';
import { UseCase } from './base.use-case';

// 1. Dummies de suporte para o teste
class DummyEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
  constructor(public readonly id: string) {}
}

class DummyAggregate extends AggregateRoot {
  doSomething(id: string) {
    this.pushEvent(new DummyEvent(id));
  }
}

// Subclasse concreta para testar o template
class ConcreteUseCase extends UseCase<any, any> {
  protected async handle(input: any): Promise<any> {
    await Promise.resolve(); // Resolve o aviso de método assíncrono sem await

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (input.scenario === 'direct-return') {
      const agg = new DummyAggregate();
      agg.doSomething('event-1');
      return agg;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (input.scenario === 'manual-register') {
      const agg = new DummyAggregate();
      agg.doSomething('event-2');
      this.registerAggregate(agg); // Uso do hook protegido
      return { success: true }; // Retorno não tem o agregado
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (input.scenario === 'nested-object') {
      const agg = new DummyAggregate();
      agg.doSomething('event-3');
      return { data: { user: agg } }; // Agregado aninhado
    }
  }
}

describe('UseCase (Template Method)', () => {
  let eventBus: jest.Mocked<DomainEventBus>;
  let useCase: ConcreteUseCase;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    eventBus = { publish: jest.fn(), subscribe: jest.fn() } as any;
    useCase = new ConcreteUseCase(eventBus);
  });

  it('✓ deve publicar eventos de um AggregateRoot retornado diretamente (heurística de coleta)', async () => {
    await useCase.execute({ scenario: 'direct-return' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'event-1' }),
    );
  });

  it('✓ deve publicar eventos de agregados registrados manualmente via registerAggregate()', async () => {
    await useCase.execute({ scenario: 'manual-register' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'event-2' }),
    );
  });

  it('✓ deve descobrir e publicar eventos em propriedades aninhadas no resultado (heurística iterativa)', async () => {
    await useCase.execute({ scenario: 'nested-object' });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'event-3' }),
    );
  });

  it('✓ deve limpar _pendingAggregates entre execuções diferentes', async () => {
    await useCase.execute({ scenario: 'manual-register' }); // Registra 1 agregado pendente
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledTimes(1);

    eventBus.publish.mockClear();

    // A segunda execução não deve publicar o evento da primeira execução
    await useCase.execute({ scenario: 'direct-return' });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(eventBus.publish).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'event-1' }),
    );
  });
});
