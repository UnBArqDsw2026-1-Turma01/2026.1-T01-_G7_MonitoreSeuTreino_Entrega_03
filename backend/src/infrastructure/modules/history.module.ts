import { Module, OnModuleInit } from '@nestjs/common';
import { HistoryService } from '@application/services/history.service';
import { ListSessionHistoryUseCase } from '@application/use-cases/history/list-session-history.use-case';
import { GetSessionHistoryDetailUseCase } from '@application/use-cases/history/get-session-history-detail.use-case';
import { HISTORY_SERVICE } from '@domain/history/services/i-history.service';
import { HistoryObserver } from '@domain/history/observers/history-observer';
import { WorkoutSessionSubject } from '@domain/history/observers/workout-session-subject';
import { HistoryServiceProxy } from '../services/history-service.proxy';
import { HistoryController } from '@presentation/controllers/history.controller';
import { SessionModule } from './session.module';
import { AuthModule } from './auth.module';
import { APP_LOGGER, AppLogger } from '@application/logger/logger.interface';

@Module({
  imports: [SessionModule, AuthModule],
  controllers: [HistoryController],
  providers: [
    HistoryService,
    HistoryObserver,
    {
      provide: HISTORY_SERVICE,
      useFactory: (real: HistoryService, logger: AppLogger) =>
        new HistoryServiceProxy(real, logger),
      inject: [HistoryService, APP_LOGGER],
    },
    ListSessionHistoryUseCase,
    GetSessionHistoryDetailUseCase,
  ],
})
export class HistoryModule implements OnModuleInit {
  constructor(
    private readonly workoutSessionSubject: WorkoutSessionSubject,
    private readonly historyObserver: HistoryObserver,
  ) {}

  /** Inscreve o Observer no Subject na inicialização do módulo. */
  onModuleInit(): void {
    this.workoutSessionSubject.subscribe(this.historyObserver);
  }
}
