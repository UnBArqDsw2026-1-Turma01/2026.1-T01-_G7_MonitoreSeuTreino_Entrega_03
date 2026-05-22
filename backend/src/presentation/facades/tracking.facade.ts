import { GetWeeklySummaryUseCase } from '@application/use-cases/tracking/get-weekly-summary.use-case';

export class TrackingFacade {
  constructor(
    private readonly getWeeklySummary:
      GetWeeklySummaryUseCase,
  ) {}

  weeklySummary(
    userId: string,
    weekOffset = 0,
  ) {
    return this.getWeeklySummary.execute({
      userId,
      weekOffset,
    });
  }
}