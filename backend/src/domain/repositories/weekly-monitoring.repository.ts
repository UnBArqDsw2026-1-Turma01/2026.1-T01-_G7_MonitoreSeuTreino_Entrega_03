import { CompletedSession } from '../entities/completed-session.entity';
import { DateRange } from '../value-objects/date-range.vo';

export interface WeeklyMonitoringRepository {
  findCompletedSessionsByUserAndPeriod(
    userId: string,
    period: DateRange,
  ): Promise<CompletedSession[]>;
}

export const WEEKLY_MONITORING_REPOSITORY = Symbol('WEEKLY_MONITORING_REPOSITORY');