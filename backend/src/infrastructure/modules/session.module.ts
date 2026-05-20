import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionController } from '@presentation/controllers/session.controller';
import { RegisterSessionUseCase } from '@application/use-cases/session/register-session.use-case';
import { TRAINING_SESSION_REPOSITORY } from '@domain/repositories/training-session.repository';
import { TrainingSessionRepositoryImpl } from '../database/training-session.repository.impl';
import { TrainingSessionOrmEntity } from '../database/session.orm-entity';
import { ExerciseNodeOrmEntity } from '../database/exercise-node.orm-entity';
import { TrainingSetOrmEntity } from '../database/training-set.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingSessionOrmEntity,
      ExerciseNodeOrmEntity,
      TrainingSetOrmEntity,
    ]),
  ],
  controllers: [SessionController],
  providers: [
    RegisterSessionUseCase,
    {
      provide: TRAINING_SESSION_REPOSITORY,
      useClass: TrainingSessionRepositoryImpl,
    },
  ],
  exports: [RegisterSessionUseCase, TRAINING_SESSION_REPOSITORY],
})
export class SessionModule {}