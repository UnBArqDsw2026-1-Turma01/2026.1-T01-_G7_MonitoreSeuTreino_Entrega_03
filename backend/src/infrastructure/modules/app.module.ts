import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { CorrelationIdMiddleware } from '../../presentation/middleware/correlation-id.middleware';
import { RefreshTokenOrmEntity } from '../database/refresh-token.orm-entity';
import { UserOrmEntity } from '../database/user.orm-entity';
import { OnboardingHistoryOrmEntity } from '../database/onboarding-history.orm-entity';
import { TrainingProfileOrmEntity } from '../database/training-profile.orm-entity';
import { ExerciseOrmEntity } from '../database/exercise.orm-entity';
import { RoutineOrmEntity } from '../database/routine.orm-entity';
import { TrainingSessionOrmEntity } from '../database/session.orm-entity';
import { ExerciseNodeOrmEntity } from '../database/exercise-node.orm-entity';
import { TrainingSetOrmEntity } from '../database/training-set.orm-entity';
import { winstonConfig } from '../logger/winston.config';
import { AuthModule } from './auth.module';
import { ExerciseModule } from './exercise.module';
import { OnboardingModule } from './onboarding.module';
import { RoutineModule } from '../../routine.module';
import { SessionModule } from './session.module';
import { HistoryModule } from './history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    WinstonModule.forRoot(winstonConfig),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASS'),
        database: config.getOrThrow<string>('DB_NAME'),
        entities: [
          UserOrmEntity,
          RefreshTokenOrmEntity,
          TrainingProfileOrmEntity,
          OnboardingHistoryOrmEntity,
          ExerciseOrmEntity,
          RoutineOrmEntity,
          TrainingSessionOrmEntity,
          ExerciseNodeOrmEntity,
          TrainingSetOrmEntity,
        ],
        synchronize: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    ExerciseModule,
    OnboardingModule,
    RoutineModule,
    SessionModule,
    HistoryModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
