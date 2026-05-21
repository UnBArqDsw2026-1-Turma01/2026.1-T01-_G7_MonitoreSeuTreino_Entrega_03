import { AuthenticationFacade } from './authentication.facade';

describe('AuthenticationFacade (Facade)', () => {
  let facade: AuthenticationFacade;

  // Mocks dos Casos de Uso
  const mockRegisterUserUseCase = { execute: jest.fn() };
  const mockAuthenticateUserUseCase = { execute: jest.fn() };
  const mockRotateRefreshTokenUseCase = { execute: jest.fn() };
  const mockRevokeSessionUseCase = { execute: jest.fn() };

  beforeEach(() => {
    facade = new AuthenticationFacade(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRegisterUserUseCase as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockAuthenticateUserUseCase as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRotateRefreshTokenUseCase as any,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockRevokeSessionUseCase as any,
    );
    jest.clearAllMocks();
  });

  it('✓ deve repassar os dados de registro ao RegisterUserUseCase', async () => {
    const expectedOutput = { id: '1' };
    mockRegisterUserUseCase.execute.mockResolvedValue(expectedOutput);

    const result = await facade.register(
      'Nome Teste',
      'teste@email.com',
      'senha123',
    );

    expect(result).toBe(expectedOutput);
    expect(mockRegisterUserUseCase.execute).toHaveBeenCalledWith({
      name: 'Nome Teste',
      email: 'teste@email.com',
      password: 'senha123',
    });
  });

  it('✓ deve montar o comando de revogar uma ÚNICA sessão corretamente (invalidateSession)', async () => {
    await facade.invalidateSession('user-id', 'refresh-token-valido');

    // Valida se o Facade tomou a decisão correta de incluir o currentToken no payload
    expect(mockRevokeSessionUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
      currentToken: 'refresh-token-valido',
    });
  });

  it('✓ deve montar o comando de revogar TODAS as sessões corretamente (invalidateAllSessions)', async () => {
    await facade.invalidateAllSessions('user-id');

    // Valida se o Facade tomou a decisão de negócio correta de omitir o currentToken
    expect(mockRevokeSessionUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });
});
