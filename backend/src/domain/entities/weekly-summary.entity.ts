import { DateRange } from '../value-objects/date-range.vo';

export class WeeklySummary {
  constructor(
    public readonly period: DateRange,
    public readonly totalSessions: number,
    public readonly activeDays: string[],
  ) {}

  get distinctDaysCount(): number {
    return this.activeDays.length;
  }
}