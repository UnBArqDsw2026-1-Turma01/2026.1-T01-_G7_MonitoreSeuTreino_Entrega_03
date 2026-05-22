import { UserRepository } from '../../domain/repositories/user.repository';
import { LoggingUserRepository } from './logging-user.repository';

// Mock simples para simular o serviço de logger
const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
};

jest.mock('../../infrastructure/context/request-context', () => ({
  getCorrelationId: () => 'mocked-correlation-id',
}));

describe('LoggingUserRepository (Decorator)', () => {
  let loggingRepo: LoggingUserRepository;
  let mockWrappedRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mockWrappedRepo = {
      findById: jest.fn(),
    } as any;

    // Injeta o mock do repo (que poderia ser o cache ou o base) e o mock do logger
    loggingRepo = new LoggingUserRepository(
      mockWrappedRepo,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockLoggerService as any,
    );
    jest.clearAllMocks();
  });

  it('✓ deve registrar o início da operação e retornar o resultado com sucesso', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockWrappedRepo.findById.mockResolvedValue({ id: '123' } as any);

    await loggingRepo.findById('123');

    // Valida se o log de entrada ocorreu com os metadados esperados
    expect(mockLoggerService.log).toHaveBeenCalledWith(
      'findById',
      expect.objectContaining({
        context: 'UserRepository',
        correlationId: 'mocked-correlation-id',
        userId: '123',
      }),
    );
    expect(mockWrappedRepo.findById.mock.calls).toEqual([['123']]);
  });

  it('✓ deve capturar o erro, registrar no log, e relançar a exceção', async () => {
    const error = new Error('Database connection lost');
    mockWrappedRepo.findById.mockRejectedValue(error);

    // Adicionei any pois o nome exato do método de erro depende da sua abstração LoggerService
    loggingRepo['logError'] = jest.fn();

    await expect(loggingRepo.findById('123')).rejects.toThrow(
      'Database connection lost',
    );

    expect(mockLoggerService.log).toHaveBeenCalled();
    expect(loggingRepo['logError']).toHaveBeenCalledWith('findById', error, {
      userId: '123',
    });
  });
});
