import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { APP_LOGGER, AppLogger } from '@application/logger/logger.interface';
import { SessionController } from '@presentation/controllers/session.controller';
import { RegisterSessionUseCase } from '@application/use-cases/session/register-session.use-case';
import {
  ITrainingSessionRepository,
  TRAINING_SESSION_REPOSITORY,
} from '@domain/repositories/training-session.repository';
import { TrainingSessionRepositoryImpl } from '../database/training-session.repository.impl';
import { TrainingSessionOrmEntity } from '../database/session.orm-entity';
import { ExerciseNodeOrmEntity } from '../database/exercise-node.orm-entity';
import { TrainingSetOrmEntity } from '../database/training-set.orm-entity';
import { WorkoutSessionSubject } from '@domain/history/observers/workout-session-subject';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingSessionOrmEntity,
      ExerciseNodeOrmEntity,
      TrainingSetOrmEntity,
    ]),
    AuthModule,
  ],
  controllers: [SessionController],
  providers: [
    WorkoutSessionSubject,
    {
      provide: TRAINING_SESSION_REPOSITORY,
      useClass: TrainingSessionRepositoryImpl,
    },
    {
      provide: RegisterSessionUseCase,
      useFactory: (
        sessionRepo: ITrainingSessionRepository,
        eventBus: DomainEventBus,
        logger: AppLogger,
        workoutSessionSubject: WorkoutSessionSubject,
      ) =>
        new RegisterSessionUseCase(
          sessionRepo,
          eventBus,
          logger,
          workoutSessionSubject,
        ),
      inject: [
        TRAINING_SESSION_REPOSITORY,
        DomainEventBus,
        APP_LOGGER,
        WorkoutSessionSubject,
      ],
    },
  ],
  exports: [
    RegisterSessionUseCase,
    TRAINING_SESSION_REPOSITORY,
    WorkoutSessionSubject,
  ],
})
export class SessionModule {}
