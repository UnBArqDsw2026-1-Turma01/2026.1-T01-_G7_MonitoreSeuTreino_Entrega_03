export type WeeklySummaryPeriod = {
  start: string;
  end: string;
};

export type WeeklySummary = {
  period: WeeklySummaryPeriod;
  totalSessions: number;
  activeDays: string[];
  distinctDaysCount: number;
};

export type WeeklySummaryParams = {
  weekOffset?: number;
};