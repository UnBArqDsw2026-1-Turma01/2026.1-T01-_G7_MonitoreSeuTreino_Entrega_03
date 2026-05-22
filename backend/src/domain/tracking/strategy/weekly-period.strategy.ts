import { DateRange } from '../../value-objects/date-range.vo';

export interface WeeklyPeriodStrategy {
  resolve(reference: Date): DateRange;
}

function cloneDate(date: Date): Date {
  return new Date(date.getTime());
}

function startOfUtcWeek(reference: Date): Date {
  const date = cloneDate(reference);
  const day = date.getUTCDay();
  const diff = (day + 6) % 7; // Monday as first day of week

  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);

  return date;
}

function endOfUtcWeek(reference: Date): Date {
  const start = startOfUtcWeek(reference);
  const end = cloneDate(start);

  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return end;
}

export class CurrentWeekPeriodStrategy implements WeeklyPeriodStrategy {
  constructor(private readonly weekOffset = 0) {}

  resolve(reference: Date): DateRange {
    const start = startOfUtcWeek(reference);
    start.setUTCDate(start.getUTCDate() + this.weekOffset * 7);

    const end = endOfUtcWeek(start);

    return DateRange.between(start, end);
  }
}

export class CustomPeriodStrategy implements WeeklyPeriodStrategy {
  constructor(
    private readonly start: Date,
    private readonly end: Date,
  ) {}

  resolve(): DateRange {
    const start = cloneDate(this.start);
    const end = cloneDate(this.end);

    if (start > end) {
      throw new Error('Custom period start cannot be after end.');
    }

    return DateRange.between(start, end);
  }
}