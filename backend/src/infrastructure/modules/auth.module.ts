import { DomainEventBus } from '@application/events/domain-event-bus';
import { APP_LOGGER, AppLogger } from '@application/logger/logger.interface';
import { AuthenticateUserUseCase } from '@application/use-cases/auth/authenticate-user.use-case';
import { RegisterUserUseCase } from '@application/use-cases/auth/register-user.use-case';
import { RevokeSessionUseCase } from '@application/use-cases/auth/revoke-session.use-case';
import { RotateRefreshTokenUseCase } from '@application/use-cases/auth/rotate-refresh-token.use-case';
import { DeactivateUserUseCase } from '@application/use-cases/users/deactivate-user.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';
import { REFRESH_TOKEN_REPOSITORY } from '@domain/repositories/refresh-token.repository';
import { USER_REPOSITORY } from '@domain/repositories/user.repository';
import { HASH_SERVICE } from '@domain/services/hash.service';
import { TOKEN_SERVICE } from '@domain/services/token.service';
import { CachingUserRepository } from '@infrastructure/database/caching-user.repository';
import { RefreshTokenOrmEntity } from '@infrastructure/database/refresh-token.orm-entity';
import { UserOrmEntity } from '@infrastructure/database/user.orm-entity';
import { UserPostgresRepository } from '@infrastructure/database/user.postgres-repository';
import { WinstonAppLogger } from '@infrastructure/logger/winston-app-logger';
import { BcryptHashService } from '@infrastructure/services/bcrypt-hash.service';
import { JwtTokenService } from '@infrastructure/services/jwt-token.service';
import { LoggerService, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from '@presentation/controllers/auth.controller';
import { AuthenticationFacade } from '@presentation/facades/authentication.facade';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { LoggingUserRepository } from '../database/logging-user.repository';
import { RefreshTokenPostgresRepository } from '../database/refresh-token.postgres-repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, RefreshTokenOrmEntity]),
    ThrottlerModule.forRoot([{ name: 'auth', ttl: 60_000, limit: 10 }]),
  ],
  controllers: [AuthController],
  providers: [
    // ─── Logger ─────────────────────────────────────────────────────────────
    {
      provide: APP_LOGGER,
      useFactory: (winstonLogger: LoggerService): AppLogger =>
        new WinstonAppLogger(winstonLogger),
      inject: [WINSTON_MODULE_NEST_PROVIDER],
    },

    // ─── Repositórios ────────────────────────────────────────────────────────
    {
      provide: USER_REPOSITORY,
      useFactory: (
        ormRepo: Repository<UserOrmEntity>,
        logger: LoggerService,
      ) => {
        const base = new UserPostgresRepository(ormRepo);
        const cached = new CachingUserRepository(base);
        return new LoggingUserRepository(cached, logger);
      },
      inject: [getRepositoryToken(UserOrmEntity), WINSTON_MODULE_NEST_PROVIDER],
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: RefreshTokenPostgresRepository,
    },

    // ─── Serviços ────────────────────────────────────────────────────────────
    { provide: HASH_SERVICE, useClass: BcryptHashService },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
    { provide: JwtTokenService, useClass: JwtTokenService },

    // ─── Event Bus ───────────────────────────────────────────────────────────
    {
      provide: DomainEventBus,
      useFactory: (appLogger: AppLogger) => new DomainEventBus(appLogger),
      inject: [APP_LOGGER],
    },

    // ─── Use Cases ───────────────────────────────────────────────────────────
    {
      provide: RegisterUserUseCase,
      useFactory: (userRepo, hashSvc, eventBus) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new RegisterUserUseCase(userRepo, hashSvc, eventBus),
      inject: [USER_REPOSITORY, HASH_SERVICE, DomainEventBus],
    },
    {
      provide: AuthenticateUserUseCase,
      useFactory: (userRepo, rtRepo, hashSvc, tokenSvc, eventBus) =>
        new AuthenticateUserUseCase(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          userRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          rtRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          hashSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          tokenSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          eventBus,
        ),
      inject: [
        USER_REPOSITORY,
        REFRESH_TOKEN_REPOSITORY,
        HASH_SERVICE,
        TOKEN_SERVICE,
        DomainEventBus,
      ],
    },
    {
      provide: RotateRefreshTokenUseCase,
      useFactory: (userRepo, rtRepo, hashSvc, tokenSvc, eventBus) =>
        new RotateRefreshTokenUseCase(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          userRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          rtRepo,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          hashSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          tokenSvc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          eventBus,
        ),
      inject: [
        USER_REPOSITORY,
        REFRESH_TOKEN_REPOSITORY,
        HASH_SERVICE,
        TOKEN_SERVICE,
        DomainEventBus,
      ],
    },
    {
      provide: RevokeSessionUseCase,
      useFactory: (userRepo, rtRepo, hashSvc, eventBus) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new RevokeSessionUseCase(userRepo, rtRepo, hashSvc, eventBus),
      inject: [
        USER_REPOSITORY,
        REFRESH_TOKEN_REPOSITORY,
        HASH_SERVICE,
        DomainEventBus,
      ],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepo, hashSvc, eventBus) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new UpdateUserUseCase(userRepo, hashSvc, eventBus),
      inject: [USER_REPOSITORY, HASH_SERVICE, DomainEventBus],
    },
    {
      provide: DeactivateUserUseCase,
      useFactory: (userRepo, rtRepo, eventBus) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new DeactivateUserUseCase(userRepo, rtRepo, eventBus),
      inject: [USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY, DomainEventBus],
    },

    // ─── Facade ──────────────────────────────────────────────────────────────
    {
      provide: AuthenticationFacade,
      useFactory: (register, authenticate, rotate, revoke) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        new AuthenticationFacade(register, authenticate, rotate, revoke),
      inject: [
        RegisterUserUseCase,
        AuthenticateUserUseCase,
        RotateRefreshTokenUseCase,
        RevokeSessionUseCase,
      ],
    },
  ],
  exports: [TOKEN_SERVICE, JwtTokenService, APP_LOGGER, DomainEventBus],
})
export class AuthModule {}
