import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { TrainingProfileRepository } from '@domain/onboarding/repositories/training-profile.repository';
import { InfrastructureException } from '@infrastructure/exceptions/infrastructure-exceptions';
import { TrainingProfileOrmEntity } from './training-profile.orm-entity';

@Injectable()
export class TrainingProfileRepositoryImpl
  implements TrainingProfileRepository
{
  constructor(
    @InjectRepository(TrainingProfileOrmEntity)
    private readonly repository: Repository<TrainingProfileOrmEntity>,
  ) {}

  async save(profile: TrainingProfile): Promise<void> {
    try {
      const orm = this.toPersistence(profile);
      await this.repository.save(orm);
    } catch (err) {
      throw new InfrastructureException(
        'Failed to save training profile',
        err,
        `userId=${profile.userId}`,
      );
    }
  }

  async findByUserId(userId: string): Promise<TrainingProfile | null> {
    try {
      const found = await this.repository.findOneBy({ userId });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find training profile',
        err,
        `userId=${userId}`,
      );
    }
  }

  private toPersistence(profile: TrainingProfile): TrainingProfileOrmEntity {
    const orm = new TrainingProfileOrmEntity();
    orm.id = profile.id;
    orm.userId = profile.userId;
    orm.sex = profile.sex;
    orm.age = profile.age;
    orm.experienceMonths = profile.experienceMonths;
    orm.weeklyFrequency = profile.weeklyFrequency;
    orm.mainGoal = profile.mainGoal;
    orm.followedStructuredPlan = profile.followedStructuredPlan;
    orm.techniqueLevel = profile.techniqueLevel;
    orm.usesProgressiveLoad = profile.usesProgressiveLoad;
    orm.recentConsistency = profile.recentConsistency;
    orm.hasLimitation = profile.hasLimitation;
    orm.classification = profile.classification;
    orm.score = profile.score;
    orm.completedAt = profile.completedAt;
    orm.createdAt = profile.createdAt;
    orm.updatedAt = profile.updatedAt;
    return orm;
  }

  private toDomain(orm: TrainingProfileOrmEntity): TrainingProfile {
    return TrainingProfile.reconstitute(
      orm.id,
      orm.userId,
      orm.sex,
      orm.age,
      orm.experienceMonths,
      orm.weeklyFrequency,
      orm.mainGoal,
      orm.followedStructuredPlan,
      orm.techniqueLevel,
      orm.usesProgressiveLoad,
      orm.recentConsistency,
      orm.hasLimitation,
      orm.classification,
      orm.score,
      orm.completedAt,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
