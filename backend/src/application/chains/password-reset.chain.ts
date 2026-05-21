import { PasswordResetToken } from '@domain/entities/password-reset-token.entity';
import { User } from '@domain/entities/user.entity';
import { ValidationException } from '@domain/exceptions/domain-exceptions';
import { PasswordResetTokenRepository } from '@domain/repositories/password-reset-token.repository';
import { UserRepository } from '@domain/repositories/user.repository';
import { EmailService } from '@domain/services/email.service';
import { ExpiresAt } from '@domain/value-objects/expires-at.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';
import { RegexEmailValidator } from '@domain/validators/email-validator';
import * as crypto from 'crypto';

// ─── Context ─────────────────────────────────────────────────────────────────

export interface PasswordResetChainContext {
  email: string;
  user: User | null;
  plainToken: string | null;
  resetLink: string | null;
}

// ─── Abstract Handler ─────────────────────────────────────────────────────────

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role Handler
 * @feature RF04 — Password Reset
 *
 * Base class for every step in the password-reset flow.
 * Each subclass either processes its step and calls next(), or throws a
 * domain exception to abort the chain.
 */
abstract class Handler {
  private nextHandler: Handler | null = null;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  protected async next(ctx: PasswordResetChainContext): Promise<void> {
    if (this.nextHandler) {
      await this.nextHandler.handle(ctx);
    }
  }

  abstract handle(ctx: PasswordResetChainContext): Promise<void>;
}

// ─── Concrete Handlers ────────────────────────────────────────────────────────

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF04 — Password Reset
 *
 * Step 1 — Validates that the email string is well-formed.
 * Throws ValidationException on bad format; canonicalises (trim + lowercase) on success.
 */
export class ValidateEmailFormatHandler extends Handler {
  async handle(ctx: PasswordResetChainContext): Promise<void> {
    const canonical = ctx.email.trim().toLowerCase();
    if (!new RegexEmailValidator().validate(canonical)) {
      throw new ValidationException('Invalid email format');
    }
    ctx.email = canonical;
    await this.next(ctx);
  }
}

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF04 — Password Reset
 *
 * Step 2 — Looks up the user by email.
 * Silently aborts the chain (no error) when the email is not registered,
 * so callers never learn whether an address exists in the system.
 */
export class CheckUserExistsHandler extends Handler {
  constructor(private readonly userRepository: UserRepository) {
    super();
  }

  async handle(ctx: PasswordResetChainContext): Promise<void> {
    const user = await this.userRepository.findByEmail(ctx.email);

    // Silently abort — never reveal whether the email is registered
    if (!user || user.isSoftDeleted()) {
      return;
    }

    ctx.user = user;
    await this.next(ctx);
  }
}

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF04 — Password Reset
 *
 * Step 3 — Generates a cryptographically secure single-use token.
 * Uses crypto.randomBytes(32) for the plain token and SHA-256 for DB storage
 * (deterministic hash enables direct lookup without exposing the plain value).
 * Invalidates any pre-existing token for the user before saving the new one.
 * TTL: 15 minutes.
 */
export class GenerateTokenHandler extends Handler {
  constructor(
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
  ) {
    super();
  }

  async handle(ctx: PasswordResetChainContext): Promise<void> {
    if (!ctx.user) {
      await this.next(ctx);
      return;
    }

    const plainToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(plainToken).digest('hex');
    const tokenHash = TokenHash.from(hash);

    await this.passwordResetTokenRepository.deleteByUserId(ctx.user.id);

    const token = PasswordResetToken.create(
      ctx.user.id,
      tokenHash,
      ExpiresAt.fromTtlMs(RESET_TOKEN_TTL_MS),
    );
    await this.passwordResetTokenRepository.save(token);

    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    ctx.plainToken = plainToken;
    ctx.resetLink = `${baseUrl}/reset-password?token=${plainToken}`;

    await this.next(ctx);
  }
}

/**
 * @pattern Chain of Responsibility (GoF Behavioral)
 * @role ConcreteHandler
 * @feature RF04 — Password Reset
 *
 * Step 4 — Dispatches the reset e-mail via the injected EmailService.
 * Skips gracefully when context.user or context.resetLink is null
 * (upstream handler silently aborted for an unknown address).
 * Email delivery errors are swallowed so the endpoint always returns 200
 * regardless of SMTP availability — the token is already persisted and the
 * caller must never learn whether an address is registered.
 */
export class SendEmailHandler extends Handler {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async handle(ctx: PasswordResetChainContext): Promise<void> {
    if (!ctx.user || !ctx.resetLink) {
      await this.next(ctx);
      return;
    }

    try {
      await this.emailService.sendPasswordResetEmail(
        ctx.user.email.toString(),
        ctx.resetLink,
      );
    } catch {
      // Delivery failures are logged by NodemailerEmailService; do not expose
      // to caller — the token is persisted and the link can be resent.
    }

    await this.next(ctx);
  }
}
