import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { UnauthorizedException } from '../../../domain/exceptions/domain-exceptions';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { HashService } from '../../../domain/services/hash.service';
import { TokenService } from '../../../domain/services/token.service';
import { AccessToken } from '../../../domain/value-objects/access-token.vo';
import { OpaqueToken } from '../../../domain/value-objects/opaque-token.vo';
import { TokenHash } from '../../../domain/value-objects/token-hash.vo';
import { TokenPayload } from '../../../domain/value-objects/token-payload.vo';
import { DomainEventBus } from '../../events/domain-event-bus';
import { UseCase } from '../base.use-case';

export interface RotateTokenCommand {
  token: string;
}

export interface RotateTokenResult {
  accessToken: AccessToken;
  refreshToken: OpaqueToken;
}

export class RotateRefreshTokenUseCase extends UseCase<
  RotateTokenCommand,
  RotateTokenResult
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

  protected async handle(cmd: RotateTokenCommand): Promise<RotateTokenResult> {
    const rawHash = await this.hashService.hash(cmd.token);
    const tokenHash = TokenHash.from(rawHash);

    const existingToken =
      await this.refreshTokenRepository.findByHash(tokenHash);
    if (!existingToken?.isActive()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findById(existingToken.userId);
    if (!user || user.isSoftDeleted()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const invalidated = existingToken.invalidate();
    this.registerAggregate(invalidated);
    await this.refreshTokenRepository.update(invalidated);

    const newOpaqueToken = this.tokenService.generateOpaqueToken();
    const newRawHash = await this.hashService.hash(newOpaqueToken.toString());
    const newTokenHash = TokenHash.from(newRawHash);
    const expiresAt = this.tokenService.getRefreshTokenTtl().toExpiresAt();

    const newRefreshToken = RefreshToken.create(
      user.id,
      newTokenHash,
      expiresAt,
    );
    this.registerAggregate(newRefreshToken);
    await this.refreshTokenRepository.insert(newRefreshToken);

    const payload = TokenPayload.create(user.id, user.email.toString());
    const accessToken = this.tokenService.generateAccessToken(payload);

    return { accessToken, refreshToken: newOpaqueToken };
  }
}
