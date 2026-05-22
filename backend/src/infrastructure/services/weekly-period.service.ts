import {
  WeeklyPeriodInput,
  WeeklyPeriodService,
} from '@domain/tracking/services/weekly-period.service';
import { DateRange } from '@domain/value-objects/date-range.vo';

export class WeeklyPeriodServiceImpl
  implements WeeklyPeriodService
{
  resolveCurrentWeek(
    input?: WeeklyPeriodInput,
  ): DateRange {
    return DateRange.currentWeek(
      new Date(),
      input?.weekOffset ?? 0,
    );
  }
}