import { User } from '@domain/entities/user.entity';
import {
  NotFoundException,
  ValidationException,
} from '@domain/exceptions/domain-exceptions';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { RefreshTokenRepository } from '@domain/repositories/refresh-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { HashService } from '@domain/services/hash.service';

// ─── Context ─────────────────────────────────────────────────────────────────

export interface AccountDeletionChainContext {
  userId: string;
  password: string;
  confirmation: string;
  user: User | null;
}

// ─── Abstract Handler ─────────────────────────────────────────────────────────

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role Handler
 * @feature RF07 — Delete Account
 *
 * Base class for every step in the account-deletion flow.
 * Each subclass either processes its step and calls next(), or throws a
 * domain exception to abort the chain.
 */
abstract class Handler {
  private nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  protected async next(ctx: AccountDeletionChainContext): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(ctx);
    }
  }

  abstract handle(ctx: AccountDeletionChainContext): Promise<void>;
}

// ─── Concrete Handlers ────────────────────────────────────────────────────────

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF07 — Delete Account
 *
 * Step 1 — Loads the user and verifies the provided password via bcrypt.
 * Throws NotFoundException if the user does not exist (or is soft-deleted).
 * Throws ValidationException if the password does not match.
 */
export class ValidatePasswordHandler extends Handler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
  ) {
    super();
  }

  async handle(ctx: AccountDeletionChainContext): Promise<void> {
    const user = await this.userRepository.findById(ctx.userId);
    if (!user || user.isSoftDeleted()) {
      throw new NotFoundException('User not found', { userId: ctx.userId });
    }

    const matches = await this.hashService.compare(
      ctx.password,
      user.hashedPassword.toString(),
    );
    if (!matches) {
      throw new ValidationException('Incorrect password');
    }

    ctx.user = user;
    await this.next(ctx);
  }
}

const REQUIRED_PHRASE = 'CONFIRMAR';

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF07 — Delete Account
 *
 * Step 2 — Enforces the explicit confirmation phrase "CONFIRMAR" (case-sensitive).
 * Throws ValidationException if the phrase does not match exactly.
 */
export class ValidateConfirmationPhraseHandler extends Handler {
  async handle(ctx: AccountDeletionChainContext): Promise<void> {
    if (ctx.confirmation !== REQUIRED_PHRASE) {
      throw new ValidationException(
        `Confirmation phrase must be exactly "${REQUIRED_PHRASE}"`,
      );
    }
    await this.next(ctx);
  }
}

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF07 — Delete Account
 *
 * Step 3 — Hard-deletes all refresh tokens for the user before the account
 * row is removed, satisfying the FK constraint on the refresh_tokens table.
 */
export class RevokeSessionsHandler extends Handler {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    super();
  }

  async handle(ctx: AccountDeletionChainContext): Promise<void> {
    await this.refreshTokenRepository.deleteByUserId(ctx.userId);
    await this.next(ctx);
  }
}

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF07 — Delete Account
 *
 * Step 4 — Removes all password-reset tokens for the user, then hard-deletes
 * the user row (permanent, irreversible).
 */
export class DeleteAccountHandler extends Handler {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {
    super();
  }

  async handle(ctx: AccountDeletionChainContext): Promise<void> {
    await this.passwordResetTokenRepository.deleteByUserId(ctx.userId);
    await this.userRepository.hardDelete(ctx.userId);
    await this.next(ctx);
  }
}
