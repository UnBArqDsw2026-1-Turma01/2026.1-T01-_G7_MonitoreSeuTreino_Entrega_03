import { NotFoundException } from '../../../domain/exceptions/domain-exceptions';
import { RefreshTokenRepository } from '../../../domain/repositories/refresh-token.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { DomainEventBus } from '../../events/domain-event-bus';
import { UseCase } from '../base.use-case';

export class DeactivateUserUseCase extends UseCase<string, void> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user || user.isSoftDeleted()) {
      throw new NotFoundException('User not found', { userId: id });
    }

    const deactivated = user.markAsDeleted(); // Gera evento de desativação
    this.registerAggregate(deactivated);
    await this.userRepository.update(deactivated);
    await this.refreshTokenRepository.revokeAllByUserId(id);
  }
}
