import { WeeklySummary } from '@domain/entities/weekly-summary.entity';

export class TrackingViewModel {
  static toResponse(
    summary: WeeklySummary,
  ) {
    return {
      period: {
        start:
          summary.period.start.toISOString(),

        end:
          summary.period.end.toISOString(),
      },

      totalSessions:
        summary.totalSessions,

      activeDays:
        summary.activeDays,

      distinctDaysCount:
        summary.distinctDaysCount,
    };
  }
}