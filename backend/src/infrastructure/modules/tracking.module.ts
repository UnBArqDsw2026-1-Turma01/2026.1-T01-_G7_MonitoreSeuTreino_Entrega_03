import { LoggerService, Module } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AuthModule } from './auth.module';
import { WinstonAppLogger } from '../logger/winston-app-logger';
import { WeeklyMonitoringRepositoryImpl } from '../database/weekly-monitoring.repository.impl';
import { APP_LOGGER, AppLogger } from '../../application/logger/logger.interface';
import { DomainEventBus } from '../../application/events/domain-event-bus';
import { GetWeeklySummaryUseCase } from '../../application/use-cases/tracking/get-weekly-summary.use-case';
import { WEEKLY_MONITORING_REPOSITORY } from '../../domain/repositories/weekly-monitoring.repository';
import {
  WEEKLY_PERIOD_FACTORY,
  type WeeklyPeriodFactory,
} from '../../domain/tracking/services/weekly-period.service';
import {
  ACTIVE_DAYS_STRATEGY,
  TOTAL_SESSIONS_STRATEGY,
  WEEKLY_SUMMARY_SERVICE,
  type ActiveDaysStrategy,
  type TotalSessionsStrategy,
  type WeeklySummaryService,
} from '../../domain/tracking/services/weekly-summary.service';
import {
  DefaultActiveDaysStrategy,
  DefaultTotalSessionsStrategy,
  WeeklySummaryServiceImpl,
} from '../../domain/tracking/strategy/weekly-summary.strategy';
import { DefaultWeeklyPeriodFactory } from '../../domain/tracking/factory/weekly-period.factory';
import { TrackingController } from '../../presentation/controllers/tracking.controller';
import { TrackingFacade } from '../../presentation/facades/tracking.facade';
import { BearerTokenGuard } from '../../presentation/guards/bearer-token.guard';

@Module({
  imports: [AuthModule],
  controllers: [TrackingController],
  providers: [
    {
      provide: APP_LOGGER,
      useFactory: (winstonLogger: LoggerService): AppLogger =>
        new WinstonAppLogger(winstonLogger),
      inject: [WINSTON_MODULE_NEST_PROVIDER],
    },
    {
      provide: WEEKLY_MONITORING_REPOSITORY,
      useClass: WeeklyMonitoringRepositoryImpl,
    },
    {
      provide: WEEKLY_PERIOD_FACTORY,
      useClass: DefaultWeeklyPeriodFactory,
    },
    {
      provide: TOTAL_SESSIONS_STRATEGY,
      useClass: DefaultTotalSessionsStrategy,
    },
    {
      provide: ACTIVE_DAYS_STRATEGY,
      useClass: DefaultActiveDaysStrategy,
    },
    {
      provide: WEEKLY_SUMMARY_SERVICE,
      useFactory: (
        totalSessionsStrategy: TotalSessionsStrategy,
        activeDaysStrategy: ActiveDaysStrategy,
      ): WeeklySummaryService =>
        new WeeklySummaryServiceImpl(
          totalSessionsStrategy,
          activeDaysStrategy,
        ),
      inject: [TOTAL_SESSIONS_STRATEGY, ACTIVE_DAYS_STRATEGY],
    },
    {
      provide: DomainEventBus,
      useFactory: (appLogger: AppLogger) => new DomainEventBus(appLogger),
      inject: [APP_LOGGER],
    },
    {
      provide: GetWeeklySummaryUseCase,
      useFactory: (
        repository: WeeklyMonitoringRepositoryImpl,
        periodFactory: WeeklyPeriodFactory,
        summaryService: WeeklySummaryService,
        eventBus: DomainEventBus,
      ) =>
        new GetWeeklySummaryUseCase(
          repository,
          periodFactory,
          summaryService,
          eventBus,
        ),
      inject: [
        WEEKLY_MONITORING_REPOSITORY,
        WEEKLY_PERIOD_FACTORY,
        WEEKLY_SUMMARY_SERVICE,
        DomainEventBus,
      ],
    },
    {
      provide: TrackingFacade,
      useFactory: (useCase: GetWeeklySummaryUseCase) =>
        new TrackingFacade(useCase),
      inject: [GetWeeklySummaryUseCase],
    },
    BearerTokenGuard,
  ],
  exports: [TrackingFacade],
})
export class TrackingModule {}