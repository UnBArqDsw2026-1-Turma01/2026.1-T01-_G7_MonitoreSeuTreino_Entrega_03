import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CompletedSession } from '@domain/entities/completed-session.entity';
import { WeeklyMonitoringRepository } from '@domain/repositories/weekly-monitoring.repository';
import { DateRange } from '@domain/value-objects/date-range.vo';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { WeeklyMonitoringOrmEntity } from './weekly-monitoring.orm-entity';

@Injectable()
export class WeeklyMonitoringRepositoryImpl
  implements WeeklyMonitoringRepository
{
  constructor(
    @InjectRepository(WeeklyMonitoringOrmEntity)
    private readonly repository: Repository<WeeklyMonitoringOrmEntity>,
  ) {}

  async findCompletedSessionsByUserAndPeriod(
    userId: string,
    period: DateRange,
  ): Promise<CompletedSession[]> {
    try {
      const rows = await this.repository.find({
        where: {
          userId,
          concludedAt: Between(period.start, period.end),
        },
        order: {
          concludedAt: 'DESC',
        },
      });

      return rows.map(
        (row) =>
          new CompletedSession(
            row.id,
            row.userId,
            row.concludedAt!,
            row.routineId,
          ),
      );
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find completed sessions',
        err,
        `userId=${userId}`,
      );
    }
  }
}