import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { LoggerService } from '@nestjs/common';
import { ExerciseOrmEntity } from '../database/exercise.orm-entity';
import { AuthModule } from './auth.module';
import { ExercisePostgresRepository } from '../database/exercise.postgres-repository';
import { CachingExerciseRepository } from '../database/caching-exercise.repository';
import { LoggingExerciseRepository } from '../database/logging-exercise.repository';
import { EXERCISE_REPOSITORY } from '@domain/exercises/repositories/exercise.repository';
import { CreateExerciseUseCase } from '@application/use-cases/exercises/create-exercise.use-case';
import { FindExercisesUseCase } from '@application/use-cases/exercises/find-exercises.use-case';
import { UpdateExerciseUseCase } from '@application/use-cases/exercises/update-exercise.use-case';
import { DeactivateExerciseUseCase } from '@application/use-cases/exercises/deactivate-exercise.use-case';
import { ExercisesController } from '@presentation/controllers/exercises.controller';
import { ExerciseFacade } from '@presentation/facades/exercise.facade';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseOrmEntity]), AuthModule],
  controllers: [ExercisesController],
  providers: [
    {
      provide: EXERCISE_REPOSITORY,
      useFactory: (logger: LoggerService, repository: ExercisePostgresRepository) =>
        new LoggingExerciseRepository(
          new CachingExerciseRepository(repository),
          logger,
        ),
      inject: [WINSTON_MODULE_NEST_PROVIDER, ExercisePostgresRepository],
    },
    ExercisePostgresRepository,
    {
      provide: CreateExerciseUseCase,
      useFactory: (exerciseRepository) => new CreateExerciseUseCase(exerciseRepository),
      inject: [EXERCISE_REPOSITORY],
    },
    {
      provide: FindExercisesUseCase,
      useFactory: (exerciseRepository) => new FindExercisesUseCase(exerciseRepository),
      inject: [EXERCISE_REPOSITORY],
    },
    {
      provide: UpdateExerciseUseCase,
      useFactory: (exerciseRepository) => new UpdateExerciseUseCase(exerciseRepository),
      inject: [EXERCISE_REPOSITORY],
    },
    {
      provide: DeactivateExerciseUseCase,
      useFactory: (exerciseRepository) => new DeactivateExerciseUseCase(exerciseRepository),
      inject: [EXERCISE_REPOSITORY],
    },
    {
      provide: ExerciseFacade,
      useFactory: (create, find, update, deactivate) =>
        new ExerciseFacade(create, find, update, deactivate),
      inject: [
        CreateExerciseUseCase,
        FindExercisesUseCase,
        UpdateExerciseUseCase,
        DeactivateExerciseUseCase,
      ],
    },
  ],
})
export class ExerciseModule {}