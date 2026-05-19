import { DomainEventBus } from '@application/events/domain-event-bus';
import { RefreshToken } from '@domain/entities/refresh-token.entity';
import { User } from '@domain/entities/user.entity';
import { UnauthorizedException } from '@domain/exceptions/domain-exceptions';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { HashService } from '@domain/services/hash.service';
import { TokenService } from '@domain/services/token.service';
import { AccessToken } from '@domain/value-objects/access-token.vo';
import { Email } from '@domain/value-objects/email.vo';
import { OpaqueToken } from '@domain/value-objects/opaque-token.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import { TokenPayload } from '@domain/value-objects/token-payload.vo';
import { UseCase } from '../base.use-case';

export interface AuthenticateUserCommand {
  email: string;
  password: string;
}

export interface AuthenticationResult {
  accessToken: AccessToken;
  refreshToken: OpaqueToken;
  user: User;
}

export class AuthenticateUserUseCase extends UseCase<
  AuthenticateUserCommand,
  AuthenticationResult
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(
    cmd: AuthenticateUserCommand,
  ): Promise<AuthenticationResult> {
    const user = await this.userRepository.findByEmail(
      Email.canonicalize(cmd.email),
    );

    if (!user || user.isSoftDeleted()) {
      throw new UnauthorizedException('Invalid credentials', {
        reason: user ? 'user_deleted' : 'user_not_found',
      });
    }

    const passwordMatch = await this.hashService.compare(
      cmd.password,
      user.hashedPassword.toString(),
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials', {
        reason: 'wrong_password',
        userId: user.id,
      });
    }

    const payload = TokenPayload.create(user.id, user.email.toString());
    const accessToken = this.tokenService.generateAccessToken(payload);
    const opaqueToken = this.tokenService.generateOpaqueToken();

    const rawHash = await this.hashService.hash(opaqueToken.toString());
    const tokenHash = TokenHash.from(rawHash);
    const expiresAt = this.tokenService.getRefreshTokenTtl().toExpiresAt();

    const refreshToken = RefreshToken.create(user.id, tokenHash, expiresAt);
    await this.refreshTokenRepository.insert(refreshToken);

    return { accessToken, refreshToken: opaqueToken, user };
  }
}
