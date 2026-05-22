import { CompletedSession } from '@domain/entities/completed-session.entity';
import { WeeklySummary } from '@domain/entities/weekly-summary.entity';
import { DateRange } from '@domain/value-objects/date-range.vo';

export interface TotalSessionsStrategy {
  calculate(sessions: CompletedSession[]): number;
}

export interface ActiveDaysStrategy {
  calculate(sessions: CompletedSession[]): string[];
}

export interface WeeklySummaryService {
  calculate(
    sessions: CompletedSession[],
    period: DateRange,
  ): WeeklySummary;
}

export const TOTAL_SESSIONS_STRATEGY = Symbol('TOTAL_SESSIONS_STRATEGY');
export const ACTIVE_DAYS_STRATEGY = Symbol('ACTIVE_DAYS_STRATEGY');
export const WEEKLY_SUMMARY_SERVICE = Symbol('WEEKLY_SUMMARY_SERVICE');