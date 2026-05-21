import { Exercise } from '@domain/exercises/entities/exercise.entity';
import {
  ExerciseRepository,
  ExerciseSearchCriteria,
} from '@domain/exercises/repositories/exercise.repository';
import { ExerciseName } from '@domain/exercises/value-objects/exercise-name.vo';
import { MuscleGroup } from '@domain/exercises/value-objects/muscle-group.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SelectQueryBuilder, Repository } from 'typeorm';
import { InfrastructureException } from '../exceptions/infrastructure-exceptions';
import { ExerciseSearchChain } from './exercise-search.chain';
import { ExerciseOrmEntity } from './exercise.orm-entity';

@Injectable()
export class ExercisePostgresRepository implements ExerciseRepository {
  constructor(
    @InjectRepository(ExerciseOrmEntity)
    private readonly repository: Repository<ExerciseOrmEntity>,
  ) {}

  private toDomain(orm: ExerciseOrmEntity): Exercise {
    return Exercise.reconstitute(
      orm.id,
      orm.userId,
      ExerciseName.reconstitute(orm.name),
      orm.muscleGroup ? MuscleGroup.reconstitute(orm.muscleGroup) : null,
      orm.active,
      Timestamp.from(orm.createdAt),
      Timestamp.from(orm.updatedAt),
      orm.deactivatedAt ? Timestamp.from(orm.deactivatedAt) : null,
    );
  }

  private toPersistence(exercise: Exercise): ExerciseOrmEntity {
    const orm = new ExerciseOrmEntity();
    orm.id = exercise.id;
    orm.userId = exercise.userId;
    orm.name = exercise.name.toString();
    orm.muscleGroup = exercise.muscleGroup?.toString() ?? null;
    orm.active = exercise.active;
    orm.createdAt = exercise.createdAt.toDate();
    orm.updatedAt = exercise.updatedAt.toDate();
    orm.deactivatedAt = exercise.deactivatedAt?.toDate() ?? null;
    return orm;
  }

  async save(exercise: Exercise): Promise<void> {
    try {
      await this.repository.save(this.toPersistence(exercise));
    } catch (err) {
      throw new InfrastructureException(
        'Failed to save exercise',
        err,
        `method=save exerciseId=${exercise.id}`,
      );
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    try {
      const found = await this.repository.findOneBy({ id });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find exercise by id',
        err,
        `method=findById exerciseId=${id}`,
      );
    }
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Exercise | null> {
    try {
      const found = await this.repository.findOneBy({ id, userId });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find exercise by id and user',
        err,
        `method=findByIdAndUserId exerciseId=${id} userId=${userId}`,
      );
    }
  }

  async findMany(criteria: ExerciseSearchCriteria): Promise<Exercise[]> {
    try {
      const queryBuilder = this.repository
        .createQueryBuilder('exercise')
        .orderBy('exercise.name', 'ASC');

      await new ExerciseSearchChain().execute({
        criteria,
        queryBuilder: queryBuilder as SelectQueryBuilder<ExerciseOrmEntity>,
      });

      const rows = await queryBuilder.getMany();
      return rows.map((orm) => this.toDomain(orm));
    } catch (err) {
      throw new InfrastructureException(
        'Failed to search exercises',
        err,
        `method=findMany userId=${criteria.userId}`,
      );
    }
  }

  async update(exercise: Exercise): Promise<void> {
    try {
      await this.repository.save(this.toPersistence(exercise));
    } catch (err) {
      throw new InfrastructureException(
        'Failed to update exercise',
        err,
        `method=update exerciseId=${exercise.id}`,
      );
    }
  }
}