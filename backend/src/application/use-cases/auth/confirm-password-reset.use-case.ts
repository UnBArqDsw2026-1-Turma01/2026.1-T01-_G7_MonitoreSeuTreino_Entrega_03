import { DomainEventBus } from '@application/events/domain-event-bus';
import { PasswordResetCompletedEvent } from '@domain/events/user-events';
import {
  NotFoundException,
  UnauthorizedException,
  ValidationException,
} from '@domain/exceptions/domain-exceptions';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { HashService } from '@domain/services/hash.service';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { PlainPassword } from '@domain/value-objects/plain-password.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import * as crypto from 'crypto';
import { UseCase } from '../base.use-case';

export interface ConfirmPasswordResetCommand {
  token: string;
  newPassword: string;
}

export class ConfirmPasswordResetUseCase extends UseCase<
  ConfirmPasswordResetCommand,
  void
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly hashService: HashService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(cmd: ConfirmPasswordResetCommand): Promise<void> {
    const hash = crypto
      .createHash('sha256')
      .update(cmd.token)
      .digest('hex');
    const tokenHash = TokenHash.from(hash);

    const resetToken =
      await this.passwordResetTokenRepository.findByTokenHash(tokenHash);

    if (!resetToken) {
      throw new UnauthorizedException('Invalid or expired password reset token');
    }
    if (resetToken.isExpired()) {
      throw new UnauthorizedException('Password reset token has expired');
    }
    if (resetToken.isUsed()) {
      throw new UnauthorizedException('Password reset token has already been used');
    }

    const user = await this.userRepository.findById(resetToken.userId);
    if (!user || user.isSoftDeleted()) {
      throw new NotFoundException('User not found');
    }

    const plainPassword = PlainPassword.create(cmd.newPassword);
    const hashedStr = await this.hashService.hash(plainPassword.toString());
    const hashedPassword = HashedPassword.fromHash(hashedStr);

    const updatedUser = user.changePassword(hashedPassword);
    await this.userRepository.update(updatedUser);

    const usedToken = resetToken.markAsUsed();
    await this.passwordResetTokenRepository.save(usedToken);

    await this.eventBus.publish(
      new PasswordResetCompletedEvent(user.id, new Date()),
    );
  }

  protected validateNewPassword(raw: string): void {
    if (raw.length < 8 || raw.length > 64) {
      throw new ValidationException('Password must be 8–64 characters');
    }
  }
}
