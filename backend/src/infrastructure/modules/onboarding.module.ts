import { GetMyOnboardingUseCase } from '@application/use-cases/onboarding/get-my-onboarding.use-case';
import { RedoOnboardingUseCase } from '@application/use-cases/onboarding/redo-onboarding.use-case';
import { SubmitOnboardingUseCase } from '@application/use-cases/onboarding/submit-onboarding.use-case';
import { OnboardingFacade } from '@presentation/facades/onboarding.facade';
import {
  ONBOARDING_HISTORY_REPOSITORY,
  OnboardingHistoryRepository,
} from '@domain/onboarding/repositories/onboarding-history.repository';
import {
  TRAINING_PROFILE_REPOSITORY,
  TrainingProfileRepository,
} from '@domain/onboarding/repositories/training-profile.repository';
import { OnboardingHistoryOrmEntity } from '@infrastructure/database/onboarding-history.orm-entity';
import { OnboardingHistoryRepositoryImpl } from '@infrastructure/database/onboarding-history.repository.impl';
import { TrainingProfileOrmEntity } from '@infrastructure/database/training-profile.orm-entity';
import { TrainingProfileRepositoryImpl } from '@infrastructure/database/training-profile.repository.impl';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from '@presentation/controllers/onboarding.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingProfileOrmEntity,
      OnboardingHistoryOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [OnboardingController],
  providers: [
    // ─── Repositórios ────────────────────────────────────────────────────────
    {
      provide: TRAINING_PROFILE_REPOSITORY,
      useClass: TrainingProfileRepositoryImpl,
    },
    {
      provide: ONBOARDING_HISTORY_REPOSITORY,
      useClass: OnboardingHistoryRepositoryImpl,
    },

    // ─── Use Cases ───────────────────────────────────────────────────────────
    {
      provide: GetMyOnboardingUseCase,
      useFactory: (repo: TrainingProfileRepository) =>
        new GetMyOnboardingUseCase(repo),
      inject: [TRAINING_PROFILE_REPOSITORY],
    },
    {
      provide: SubmitOnboardingUseCase,
      useFactory: (repo: TrainingProfileRepository) =>
        new SubmitOnboardingUseCase(repo),
      inject: [TRAINING_PROFILE_REPOSITORY],
    },
    {
      provide: RedoOnboardingUseCase,
      useFactory: (
        profileRepo: TrainingProfileRepository,
        historyRepo: OnboardingHistoryRepository,
      ) => new RedoOnboardingUseCase(profileRepo, historyRepo),
      inject: [TRAINING_PROFILE_REPOSITORY, ONBOARDING_HISTORY_REPOSITORY],
    },

    // ─── Facade ──────────────────────────────────────────────────────────────
    {
      provide: OnboardingFacade,
      useFactory: (
        getStatus: GetMyOnboardingUseCase,
        submit: SubmitOnboardingUseCase,
        redo: RedoOnboardingUseCase,
      ) => new OnboardingFacade(getStatus, submit, redo),
      inject: [
        GetMyOnboardingUseCase,
        SubmitOnboardingUseCase,
        RedoOnboardingUseCase,
      ],
    },
  ],
})
export class OnboardingModule {}
