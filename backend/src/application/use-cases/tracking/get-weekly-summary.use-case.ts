import { DomainEventBus } from '../../events/domain-event-bus';
import { UseCase } from '../base.use-case';
import { WeeklySummary } from '../../../domain/entities/weekly-summary.entity';
import { WeeklyMonitoringRepository } from '../../../domain/repositories/weekly-monitoring.repository';
import {
  WeeklyPeriodFactory,
} from '../../../domain/tracking/services/weekly-period.service';
import {
  WeeklySummaryService,
} from '../../../domain/tracking/services/weekly-summary.service';
import { DateRange } from '../../../domain/value-objects/date-range.vo';

export interface GetWeeklySummaryCommand {
  userId: string;
  weekOffset?: number;
}

export class GetWeeklySummaryUseCase extends UseCase<
  GetWeeklySummaryCommand,
  WeeklySummary
> {
  constructor(
    private readonly trackingRepository: WeeklyMonitoringRepository,
    private readonly periodFactory: WeeklyPeriodFactory,
    private readonly summaryService: WeeklySummaryService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(cmd: GetWeeklySummaryCommand): Promise<WeeklySummary> {
    const periodStrategy = this.periodFactory.create({
      mode: 'current-week',
      weekOffset: cmd.weekOffset ?? 0,
    });

    const period: DateRange = periodStrategy.resolve(new Date());

    const sessions =
      await this.trackingRepository.findCompletedSessionsByUserAndPeriod(
        cmd.userId,
        period,
      );

    return this.summaryService.calculate(sessions, period);
  }
}