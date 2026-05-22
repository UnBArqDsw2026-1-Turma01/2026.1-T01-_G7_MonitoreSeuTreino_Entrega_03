import {
  type WeeklyPeriodFactory,
  type WeeklyPeriodParams,
} from '../services/weekly-period.service';
import {
  CustomPeriodStrategy,
  CurrentWeekPeriodStrategy,
  type WeeklyPeriodStrategy,
} from '../strategy/weekly-period.strategy';

export class DefaultWeeklyPeriodFactory implements WeeklyPeriodFactory {
  create(params: WeeklyPeriodParams): WeeklyPeriodStrategy {
    switch (params.mode) {
      case 'current-week':
        return new CurrentWeekPeriodStrategy(params.weekOffset ?? 0);

      case 'custom':
        if (!params.start || !params.end) {
          throw new Error('Custom period requires both start and end dates.');
        }

        return new CustomPeriodStrategy(params.start, params.end);

      default:
        throw new Error(`Unsupported weekly period mode: ${params.mode}`);
    }
  }
}