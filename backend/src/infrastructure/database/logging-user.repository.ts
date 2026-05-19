import { User } from '@domain/entities/user.entity';
import {
  PaginatedResult,
  UserRepository,
} from '@domain/repositories/user.repository';
import { Page } from '@domain/value-objects/page.vo';
import { getCorrelationId } from '@infrastructure/context/request-context';
import { LoggerService } from '@nestjs/common';
import { BaseException } from '@shared/exceptions/base.exception';

export class LoggingUserRepository implements UserRepository {
  constructor(
    private readonly wrapped: UserRepository,
    private readonly logger: LoggerService,
  ) {}

  private meta(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      context: 'UserRepository',
      correlationId: getCorrelationId(),
      ...extra,
    };
  }

  private logError(
    method: string,
    err: unknown,
    extra: Record<string, unknown>,
  ): void {
    this.logger.error(`UserRepository.${method} failed`, {
      ...this.meta(extra),
      method,
      error: err instanceof Error ? err.message : err,
      code: err instanceof BaseException ? err.code : 'UNKNOWN',
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  async save(user: User): Promise<void> {
    this.logger.log('save started', this.meta({ userId: user.id }));
    try {
      await this.wrapped.save(user);
      this.logger.log('save completed', this.meta({ userId: user.id }));
    } catch (err) {
      this.logError('save', err, { userId: user.id });
      if (err instanceof BaseException)
        err.withContext({ passedThrough: 'LoggingUserRepository' });
      throw err;
    }
  }

  async findById(id: string): Promise<User | null> {
    this.logger.log('findById', this.meta({ userId: id }));
    try {
      return await this.wrapped.findById(id);
    } catch (err) {
      this.logError('findById', err, { userId: id });
      if (err instanceof BaseException)
        err.withContext({ passedThrough: 'LoggingUserRepository' });
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(
      'findByEmail',
      this.meta({ emailDomain: email.split('@')[1] }),
    );
    try {
      return await this.wrapped.findByEmail(email);
    } catch (err) {
      this.logError('findByEmail', err, { emailDomain: email.split('@')[1] });
      if (err instanceof BaseException)
        err.withContext({ passedThrough: 'LoggingUserRepository' });
      throw err;
    }
  }

  async findAll(page: Page): Promise<PaginatedResult<User>> {
    this.logger.log(
      'findAll',
      this.meta({ page: page.page, limit: page.limit }),
    );
    try {
      return await this.wrapped.findAll(page);
    } catch (err) {
      this.logError('findAll', err, {});
      throw err;
    }
  }

  async update(user: User): Promise<void> {
    this.logger.log('update', this.meta({ userId: user.id }));
    try {
      await this.wrapped.update(user);
    } catch (err) {
      this.logError('update', err, { userId: user.id });
      if (err instanceof BaseException)
        err.withContext({ passedThrough: 'LoggingUserRepository' });
      throw err;
    }
  }

  async hardDelete(id: string): Promise<void> {
    this.logger.warn('hardDelete', this.meta({ userId: id }));
    try {
      await this.wrapped.hardDelete(id);
    } catch (err) {
      this.logError('hardDelete', err, { userId: id });
      throw err;
    }
  }
}
