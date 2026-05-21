import { DomainEventBus } from '@application/events/domain-event-bus';
import { AppLogger } from '@application/logger/logger.interface';
import { DomainEvent } from '@domain/events/domain-event';

class DummyDomainEvent implements DomainEvent {
  public readonly occurredAt: Date = new Date();
}

describe('DomainEventBus (Observer Subject)', () => {
  let eventBus: DomainEventBus;
  let mockLogger: jest.Mocked<AppLogger>;

  beforeEach(() => {
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      verbose: jest.fn(),
    } as unknown as jest.Mocked<AppLogger>;
    eventBus = new DomainEventBus(mockLogger);
  });

  it('✓ deve notificar todos os handlers inscritos para o evento', async () => {
    const handler1 = jest.fn().mockResolvedValue(undefined);
    const handler2 = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe('DummyDomainEvent', handler1);
    eventBus.subscribe('DummyDomainEvent', handler2);

    const event = new DummyDomainEvent();
    await eventBus.publish(event);

    expect(handler1).toHaveBeenCalledWith(event);
    expect(handler2).toHaveBeenCalledWith(event);
  });

  it('✓ não deve interromper as notificações se um dos handlers falhar (isolamento allSettled)', async () => {
    const failingHandler = jest
      .fn()
      .mockRejectedValue(new Error('Handler falhou'));
    const successHandler = jest.fn().mockResolvedValue(undefined);

    eventBus.subscribe('DummyDomainEvent', failingHandler);
    eventBus.subscribe('DummyDomainEvent', successHandler);

    await eventBus.publish(new DummyDomainEvent());

    // O segundo handler DEVE ter sido chamado mesmo com a falha do primeiro
    expect(successHandler).toHaveBeenCalled();

    // O erro deve ter sido capturado e logado internamente

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Event handler failed',
      expect.objectContaining({
        eventName: 'DummyDomainEvent',
        reason: 'Handler falhou',
      }),
    );
  });
});
