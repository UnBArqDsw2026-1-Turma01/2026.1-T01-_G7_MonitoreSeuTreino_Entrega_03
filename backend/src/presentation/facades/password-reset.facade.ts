import {
  CheckUserExistsHandler,
  GenerateTokenHandler,
  PasswordResetChainContext,
  SendEmailHandler,
  ValidateEmailFormatHandler,
} from '@application/chains/password-reset.chain';
import { ConfirmPasswordResetUseCase } from '@application/use-cases/auth/confirm-password-reset.use-case';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { ValidationException } from '@domain/exceptions/domain-exceptions';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { EmailService } from '@domain/services/email.service';

/**
 * @pattern Facade (GoF Structural)
 * @role Facade
 * @feature RF04 — Password Reset
 *
 * Single entry point for all password-reset operations.
 * Hides the orchestration of the Chain of Responsibility, token repository,
 * email service, and confirm use-case behind two simple methods.
 * Controllers interact only with this class — never with individual handlers
 * or use cases.
 */
export class PasswordResetFacade {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly emailService: EmailService,
    private readonly confirmPasswordReset: ConfirmPasswordResetUseCase,
    private readonly eventBus: DomainEventBus,
  ) {}

  async requestReset(email: string): Promise<void> {
    const command = new PasswordResetRequestBuilder().setEmail(email).build();

    const ctx: PasswordResetChainContext = {
      email: command.email,
      user: null,
      plainToken: null,
      resetLink: null,
    };

    const chain = new ValidateEmailFormatHandler();
    chain
      .setNext(new CheckUserExistsHandler(this.userRepository))
      .setNext(new GenerateTokenHandler(this.passwordResetTokenRepository))
      .setNext(new SendEmailHandler(this.emailService));

    await chain.handle(ctx);
  }

  async confirmReset(token: string, newPassword: string): Promise<void> {
    await this.confirmPasswordReset.execute({ token, newPassword });
  }
}

// ─── Builder ──────────────────────────────────────────────────────────────────

interface PasswordResetRequestCommand {
  email: string;
}

/**
 * @pattern Builder (GoF Creational)
 * @role ConcreteBuilder
 * @feature RF04 — Password Reset
 *
 * Builds a validated PasswordResetRequestCommand step by step.
 * Throws ValidationException in build() if required fields are missing.
 */
class PasswordResetRequestBuilder {
  private email?: string;

  setEmail(email: string): this {
    this.email = email;
    return this;
  }

  build(): PasswordResetRequestCommand {
    this.validate();
    return { email: this.email! };
  }

  private validate(): void {
    if (!this.email || this.email.trim().length === 0) {
      throw new ValidationException('email is required');
    }
  }
}
