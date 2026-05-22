export class DateRange {
  private constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {
    if (start > end) {
      throw new Error('DateRange: start must be <= end');
    }
  }

  static between(start: Date, end: Date): DateRange {
    return new DateRange(start, end);
  }

  static currentWeek(reference = new Date(), offsetWeeks = 0): DateRange {
    const base = new Date(reference);
    base.setHours(0, 0, 0, 0);

    const day = base.getDay(); // 0 = Sunday
    const mondayDelta = day === 0 ? -6 : 1 - day;

    const start = new Date(base);
    start.setDate(base.getDate() + mondayDelta + offsetWeeks * 7);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return new DateRange(start, end);
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end;
  }

  static dayKey(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}