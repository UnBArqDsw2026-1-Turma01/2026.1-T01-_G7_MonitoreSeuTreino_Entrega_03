import { UserRepository } from '@domain/repositories/user.repository';
import { CachingUserRepository } from '@infrastructure/database/caching-user.repository';

describe('CachingUserRepository (Decorator)', () => {
  let cachingRepo: CachingUserRepository;
  let mockWrappedRepo: jest.Mocked<UserRepository>;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mockUser = {
    id: '123',
    email: { toString: () => 'test@email.com' },
  } as any;

  beforeEach(() => {
    // Cria um mock do repositório base (simulando o banco real)
    mockWrappedRepo = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      hardDelete: jest.fn(),
    };

    cachingRepo = new CachingUserRepository(mockWrappedRepo);
  });

  const getFindByIdMock = () => mockWrappedRepo['findById'] as jest.Mock;

  it('✓ deve delegar a chamada ao wrapped repo no primeiro acesso (Cache Miss)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockWrappedRepo.findById.mockResolvedValue(mockUser);
    const findByIdMock = getFindByIdMock();

    const result = await cachingRepo.findById('123');

    expect(result).toBe(mockUser);
    expect(findByIdMock).toHaveBeenCalledTimes(1);
    expect(findByIdMock).toHaveBeenCalledWith('123');
  });

  it('✓ deve retornar a instância em memória sem chamar o wrapped repo no segundo acesso (Cache Hit)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockWrappedRepo.findById.mockResolvedValue(mockUser);

    // 1º chamada: Popula o cache
    await cachingRepo.findById('123');
    // 2º chamada: Deve vir do cache
    const resultFromCache = await cachingRepo.findById('123');

    expect(resultFromCache).toBe(mockUser);
    // O mock base só pode ter sido chamado na 1ª vez
    expect(getFindByIdMock()).toHaveBeenCalledTimes(1);
  });

  it('✓ deve atualizar o cache e delegar ao wrapped repo durante um update', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    mockWrappedRepo.findById.mockResolvedValue(mockUser);
    await cachingRepo.findById('123'); // Popula cache inicial

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const updatedUser = {
      id: '123',
      email: { toString: () => 'novo@email.com' },
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await cachingRepo.update(updatedUser);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockWrappedRepo.update).toHaveBeenCalledWith(updatedUser);

    // Testa se o email antigo foi invalidado e o novo está servindo o cache
    mockWrappedRepo.findById.mockClear(); // Limpa chamadas ao mock
    const afterUpdate = await cachingRepo.findById('123');
    expect(afterUpdate).toBe(updatedUser);
    expect(getFindByIdMock()).not.toHaveBeenCalled(); // Garante que pegou do cache atualizado
  });
});
