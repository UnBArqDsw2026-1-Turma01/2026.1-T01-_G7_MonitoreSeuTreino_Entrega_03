import {
  AuthenticateUserUseCase,
  AuthenticationResult,
} from '@application/use-cases/auth/authenticate-user.use-case';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user.use-case';
import { RevokeSessionUseCase } from '@application/use-cases/auth/revoke-session.use-case';
import {
  RotateRefreshTokenUseCase,
  RotateTokenResult,
} from '@application/use-cases/auth/rotate-refresh-token.use-case';
import { User } from '@domain/entities/user.entity';

export class AuthenticationFacade {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly authenticateUser: AuthenticateUserUseCase,
    private readonly rotateRefreshToken: RotateRefreshTokenUseCase,
    private readonly revokeSession: RevokeSessionUseCase,
  ) {}

  register(name: string, email: string, password: string): Promise<User> {
    return this.registerUser.execute({ name, email, password });
  }

  authenticate(email: string, password: string): Promise<AuthenticationResult> {
    return this.authenticateUser.execute({ email, password });
  }

  rotateToken(token: string): Promise<RotateTokenResult> {
    return this.rotateRefreshToken.execute({ token });
  }

  invalidateSession(userId: string, currentToken: string): Promise<void> {
    return this.revokeSession.execute({ userId, currentToken });
  }

  invalidateAllSessions(userId: string): Promise<void> {
    return this.revokeSession.execute({ userId });
  }
}
