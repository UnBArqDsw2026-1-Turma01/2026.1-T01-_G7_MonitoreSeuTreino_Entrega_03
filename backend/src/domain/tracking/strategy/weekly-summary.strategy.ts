import { CompletedSession } from '@domain/entities/completed-session.entity';
import { WeeklySummary } from '@domain/entities/weekly-summary.entity';
import { DateRange } from '@domain/value-objects/date-range.vo';
import {
  ActiveDaysStrategy,
  TotalSessionsStrategy,
  WeeklySummaryService,
} from '../services/weekly-summary.service';

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class DefaultTotalSessionsStrategy implements TotalSessionsStrategy {
  calculate(sessions: CompletedSession[]): number {
    return sessions.length;
  }
}

export class DefaultActiveDaysStrategy implements ActiveDaysStrategy {
  calculate(sessions: CompletedSession[]): string[] {
    const uniqueDays = new Set<string>();

    for (const session of sessions) {
      uniqueDays.add(toDayKey(session.concludedAt));
    }

    return Array.from(uniqueDays);
  }
}

export class WeeklySummaryServiceImpl implements WeeklySummaryService {
  constructor(
    private readonly totalSessionsStrategy: TotalSessionsStrategy,
    private readonly activeDaysStrategy: ActiveDaysStrategy,
  ) {}

  calculate(sessions: CompletedSession[], period: DateRange): WeeklySummary {
    const totalSessions = this.totalSessionsStrategy.calculate(sessions);
    const activeDays = this.activeDaysStrategy.calculate(sessions);

    return new WeeklySummary(period, totalSessions, activeDays);
  }
}