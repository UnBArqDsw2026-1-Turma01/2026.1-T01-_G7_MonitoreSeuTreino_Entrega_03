import { DomainEventBus } from '@application/events/domain-event-bus';
import { APP_LOGGER, AppLogger } from '@application/logger/logger.interface';
import { ConfirmPasswordResetUseCase } from '@application/use-cases/auth/confirm-password-reset.use-case';
import { PASSWORD_RESET_TOKEN_REPOSITORY } from '@domain/repositories/password-reset-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/repositories/refresh-token.repository';
import { USER_REPOSITORY } from '@domain/repositories/user.repository';
import { EMAIL_SERVICE } from '@domain/services/email.service';
import { HASH_SERVICE } from '@domain/services/hash.service';
import { TOKEN_SERVICE } from '@domain/services/token.service';
import { PasswordResetTokenPostgresRepository } from '@infrastructure/database/password-reset-token.postgres-repository';
import { PasswordResetTokenOrmEntity } from '@infrastructure/database/password-reset-token.orm-entity';
import { RefreshTokenOrmEntity } from '@infrastructure/database/refresh-token.orm-entity';
import { RefreshTokenPostgresRepository } from '@infrastructure/database/refresh-token.postgres-repository';
import { UserOrmEntity } from '@infrastructure/database/user.orm-entity';
import { WinstonAppLogger } from '@infrastructure/logger/winston-app-logger';
import { BcryptHashService } from '@infrastructure/services/bcrypt-hash.service';
import { JwtTokenService } from '@infrastructure/services/jwt-token.service';
import { NodemailerEmailService } from '@infrastructure/services/nodemailer-email.service';
import { LoggerService, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetController } from '@presentation/controllers/password-reset.controller';
import { UserController } from '@presentation/controllers/user.controller';
import { AccountDeletionFacade } from '@presentation/facades/account-deletion.facade';
import { PasswordResetFacade } from '@presentation/facades/password-reset.facade';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RefreshTokenOrmEntity,
      PasswordResetTokenOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [PasswordResetController, UserController],
  providers: [
    // ─── Logger ─────────────────────────────────────────────────────────────
    {
      provide: APP_LOGGER,
      useFactory: (winstonLogger: LoggerService): AppLogger =>
        new WinstonAppLogger(winstonLogger),
      inject: [WINSTON_MODULE_NEST_PROVIDER],
    },

    // USER_REPOSITORY is imported from AuthModule (includes CachingUserRepository)
    // so that hardDelete() invalidates the same cache used by the auth flow.
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenPostgresRepository,
    },
    {
      provide: PASSWORD_RESET_TOKEN_REPOSITORY,
      useClass: PasswordResetTokenPostgresRepository,
    },

    // ─── Serviços ────────────────────────────────────────────────────────────
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: JwtTokenService, useClass: JwtTokenService },
    { provide: EMAIL_SERVICE, useClass: NodemailerEmailService },

    // ─── Event Bus ───────────────────────────────────────────────────────────
    {
      provide: DomainEventBus,
      useFactory: (appLogger: AppLogger) => new DomainEventBus(appLogger),
      inject: [APP_LOGGER],
    },

    // ─── Use Cases ───────────────────────────────────────────────────────────
    {
      provide: ConfirmPasswordResetUseCase,
      useFactory: (userRepo, prtRepo, hashSvc, eventBus) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new ConfirmPasswordResetUseCase(userRepo, prtRepo, hashSvc, eventBus),
      inject: [
        USER_REPOSITORY,
        PASSWORD_RESET_TOKEN_REPOSITORY,
        HASH_SERVICE,
        DomainEventBus,
      ],
    },

    // ─── Facades ─────────────────────────────────────────────────────────────
    {
      provide: PasswordResetFacade,
      useFactory: (userRepo, prtRepo, emailSvc, confirmUC, eventBus) =>
        new PasswordResetFacade(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          userRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          prtRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          emailSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          confirmUC,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          eventBus,
        ),
      inject: [
        USER_REPOSITORY,
        PASSWORD_RESET_TOKEN_REPOSITORY,
        EMAIL_SERVICE,
        ConfirmPasswordResetUseCase,
        DomainEventBus,
      ],
    },
    {
      provide: AccountDeletionFacade,
      useFactory: (userRepo, rtRepo, prtRepo, hashSvc, eventBus) =>
        new AccountDeletionFacade(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          userRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          rtRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          prtRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          hashSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          eventBus,
        ),
      inject: [
        USER_REPOSITORY,
        REFRESH_TOKEN_REPOSITORY,
        PASSWORD_RESET_TOKEN_REPOSITORY,
        HASH_SERVICE,
        DomainEventBus,
      ],
    },
  ],
})
export class UserModule {}
