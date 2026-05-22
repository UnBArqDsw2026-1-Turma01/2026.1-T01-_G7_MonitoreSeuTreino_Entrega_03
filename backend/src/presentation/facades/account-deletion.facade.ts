import {
  AccountDeletionChainContext,
  DeleteAccountHandler,
  RevokeSessionsHandler,
  ValidateConfirmationPhraseHandler,
  ValidatePasswordHandler,
} from '@application/chains/account-deletion.chain';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { AccountDeletedEvent } from '@domain/events/user-events';
import { ValidationException } from '@domain/exceptions/domain-exceptions';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { HashService } from '@domain/services/hash.service';

/**
 * @pattern Facade (GoF Structural)
 * @role Facade
 * @feature RF07 — Delete Account
 *
 * Single entry point for permanent account deletion.
 * Hides the orchestration of the Chain of Responsibility (password validation,
 * confirmation phrase check, session revocation, and hard delete) behind one
 * simple method.
 * Controllers interact only with this class — never with individual handlers.
 */
export class AccountDeletionFacade {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly hashService: HashService,
    private readonly eventBus: DomainEventBus,
  ) {}

  async delete(
    userId: string,
    password: string,
    confirmation: string,
  ): Promise<void> {
    const command = new AccountDeletionRequestBuilder()
      .setUserId(userId)
      .setPassword(password)
      .setConfirmation(confirmation)
      .build();

    const ctx: AccountDeletionChainContext = {
      userId: command.userId,
      password: command.password,
      confirmation: command.confirmation,
      user: null,
    };

    const chain = new ValidatePasswordHandler(
      this.userRepository,
      this.hashService,
    );
    chain
      .setNext(new ValidateConfirmationPhraseHandler())
      .setNext(new RevokeSessionsHandler(this.refreshTokenRepository))
      .setNext(
        new DeleteAccountHandler(
          this.userRepository,
          this.passwordResetTokenRepository,
        ),
      );

    await chain.handle(ctx);

    await this.eventBus.publish(
      new AccountDeletedEvent(command.userId, new Date()),
    );
  }
}

// ─── Builder ──────────────────────────────────────────────────────────────────

interface AccountDeletionRequestCommand {
  userId: string;
  password: string;
  confirmation: string;
}

/**
 * @pattern Builder (GoF Creational)
 * @role ConcreteBuilder
 * @feature RF07 — Delete Account
 *
 * Builds a validated AccountDeletionRequestCommand step by step.
 * Throws ValidationException in build() if any required field is missing.
 */
class AccountDeletionRequestBuilder {
  private userId?: string;
  private password?: string;
  private confirmation?: string;

  setUserId(userId: string): this {
    this.userId = userId;
    return this;
  }

  setPassword(password: string): this {
    this.password = password;
    return this;
  }

  setConfirmation(confirmation: string): this {
    this.confirmation = confirmation;
    return this;
  }

  build(): AccountDeletionRequestCommand {
    this.validate();
    return {
      userId: this.userId!,
      password: this.password!,
      confirmation: this.confirmation!,
    };
  }

  private validate(): void {
    if (!this.userId || this.userId.trim().length === 0) {
      throw new ValidationException('userId is required');
    }
    if (!this.password || this.password.length === 0) {
      throw new ValidationException('password is required');
    }
    if (!this.confirmation || this.confirmation.trim().length === 0) {
      throw new ValidationException('confirmation is required');
    }
  }
}
