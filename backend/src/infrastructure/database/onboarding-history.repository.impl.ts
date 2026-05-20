import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingHistoryRepository } from '@domain/onboarding/repositories/onboarding-history.repository';
import { OnboardingMemento } from '@domain/onboarding/value-objects/onboarding-memento.vo';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { OnboardingHistoryOrmEntity } from './onboarding-history.orm-entity';

@Injectable()
export class OnboardingHistoryRepositoryImpl
  implements OnboardingHistoryRepository
{
  constructor(
    @InjectRepository(OnboardingHistoryOrmEntity)
    private readonly repository: Repository<OnboardingHistoryOrmEntity>,
  ) {}

  async save(memento: OnboardingMemento): Promise<void> {
    try {
      const orm = new OnboardingHistoryOrmEntity();
      orm.userId = memento.userId;
      orm.trainingProfileId = memento.trainingProfileId;
      orm.answersSnapshot = memento.answersSnapshot;
      orm.classification = memento.classification;
      orm.score = memento.score;
      await this.repository.save(orm);
    } catch (err) {
      throw new InfrastructureException(
        'Failed to save onboarding history',
        err,
        `userId=${memento.userId}`,
      );
    }
  }

  async findByUserId(userId: string): Promise<OnboardingMemento[]> {
    try {
      const rows = await this.repository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      return rows.map(
        (row) =>
          new OnboardingMemento(
            row.trainingProfileId,
            row.userId,
            row.answersSnapshot as any,
            row.classification,
            row.score,
          ),
      );
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find onboarding history',
        err,
        `userId=${userId}`,
      );
    }
  }
}
