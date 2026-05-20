import { DomainEventBus } from '@application/events/domain-event-bus';
import { AllSessionsRevokedEvent } from '@domain/events/refresh-token-events';
import {
  NotFoundException,
  UnauthorizedException,
} from '@domain/exceptions/domain-exceptions';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { HashService } from '@domain/services/hash.service';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import { UseCase } from '../base.use-case';

export interface RevokeSessionCommand {
  userId: string;
  currentToken?: string;
}

export class RevokeSessionUseCase extends UseCase<RevokeSessionCommand, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly hashService: HashService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(cmd: RevokeSessionCommand): Promise<void> {
    const user = await this.userRepository.findById(cmd.userId);
    if (!user || user.isSoftDeleted()) {
      throw new NotFoundException('User not found', { userId: cmd.userId });
    }

    if (cmd.currentToken) {
      await this.revokeSingleSession(cmd.userId, cmd.currentToken);
    } else {
      await this.revokeAllSessions(cmd.userId);
    }
  }

  private async revokeSingleSession(
    userId: string,
    plainToken: string,
  ): Promise<void> {
    const rawHash = await this.hashService.hash(plainToken);
    const tokenHash = TokenHash.from(rawHash);

    const token = await this.refreshTokenRepository.findByHash(tokenHash);

    if (!token) {
      return;
    }

    if (token.userId !== userId) {
      throw new UnauthorizedException('Token does not belong to user');
    }

    if (!token.isActive()) {
      return;
    }

    // SessionInvalidatedEvent e emitido dentro do método invalidate() do RefreshToken
    const invalidated = token.invalidate();

    this.registerAggregate(invalidated);

    await this.refreshTokenRepository.update(invalidated);
  }

  private async revokeAllSessions(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUserId(userId);
    await this.eventBus.publish(
      new AllSessionsRevokedEvent(userId, new Date()),
    );
  }
}
