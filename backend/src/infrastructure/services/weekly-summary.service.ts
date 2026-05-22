import { CompletedSession } from '@domain/entities/completed-session.entity';
import { WeeklySummary } from '@domain/entities/weekly-summary.entity';
import { WeeklySummaryService } from '@domain/tracking/services/weekly-summary.service';
import { DateRange } from '@domain/value-objects/date-range.vo';

export class WeeklySummaryServiceImpl
  implements WeeklySummaryService
{
  calculate(
    sessions: CompletedSession[],
    period: DateRange,
  ): WeeklySummary {
    const activeDays = [
      ...new Set(
        sessions.map((session) =>
          DateRange.dayKey(
            session.concludedAt,
          ),
        ),
      ),
    ].sort();

    return new WeeklySummary(
      period,
      sessions.length,
      activeDays,
    );
  }
}