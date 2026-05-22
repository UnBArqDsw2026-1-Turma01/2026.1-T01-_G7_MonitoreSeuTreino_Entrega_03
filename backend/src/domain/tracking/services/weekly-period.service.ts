import { WeeklyPeriodStrategy } from '../strategy/weekly-period.strategy';

export type WeeklyPeriodMode = 'current-week' | 'custom';

export interface WeeklyPeriodParams {
  mode: WeeklyPeriodMode;
  weekOffset?: number;
  start?: Date;
  end?: Date;
}

export interface WeeklyPeriodFactory {
  create(params: WeeklyPeriodParams): WeeklyPeriodStrategy;
}

export const WEEKLY_PERIOD_FACTORY = Symbol('WEEKLY_PERIOD_FACTORY');