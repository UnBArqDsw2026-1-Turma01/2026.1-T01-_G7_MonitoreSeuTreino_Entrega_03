import { Exercise } from '@domain/exercises/entities/exercise.entity';
import {
  ExerciseRepository,
  ExerciseSearchCriteria,
} from '@domain/exercises/repositories/exercise.repository';
import { getCorrelationId } from '@infrastructure/context/request-context';
import { LoggerService } from '@nestjs/common';
import { BaseException } from '@shared/exceptions/base.exception';

export class LoggingExerciseRepository implements ExerciseRepository {
  constructor(
    private readonly wrapped: ExerciseRepository,
    private readonly logger: LoggerService,
  ) {}

  private meta(extra: Record<string, unknown> = {}): Record<string, unknown> {
    return {
      context: 'ExerciseRepository',
      correlationId: getCorrelationId(),
      ...extra,
    };
  }

  private logError(
    method: string,
    err: unknown,
    extra: Record<string, unknown>,
  ): void {
    this.logger.error(`ExerciseRepository.${method} failed`, {
      ...this.meta(extra),
      method,
      error: err instanceof Error ? err.message : err,
      code: err instanceof BaseException ? err.code : 'UNKNOWN',
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  async save(exercise: Exercise): Promise<void> {
    this.logger.log('save started', this.meta({ exerciseId: exercise.id }));
    try {
      await this.wrapped.save(exercise);
      this.logger.log('save completed', this.meta({ exerciseId: exercise.id }));
    } catch (err) {
      this.logError('save', err, { exerciseId: exercise.id });
      throw err;
    }
  }

  async findById(id: string): Promise<Exercise | null> {
    this.logger.log('findById', this.meta({ exerciseId: id }));
    try {
      return await this.wrapped.findById(id);
    } catch (err) {
      this.logError('findById', err, { exerciseId: id });
      throw err;
    }
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Exercise | null> {
    this.logger.log('findByIdAndUserId', this.meta({ exerciseId: id, userId }));
    try {
      return await this.wrapped.findByIdAndUserId(id, userId);
    } catch (err) {
      this.logError('findByIdAndUserId', err, { exerciseId: id, userId });
      throw err;
    }
  }

  async findMany(criteria: ExerciseSearchCriteria): Promise<Exercise[]> {
    this.logger.log('findMany', this.meta({ userId: criteria.userId }));
    try {
      return await this.wrapped.findMany(criteria);
    } catch (err) {
      this.logError('findMany', err, { userId: criteria.userId });
      throw err;
    }
  }

  async update(exercise: Exercise): Promise<void> {
    this.logger.log('update', this.meta({ exerciseId: exercise.id }));
    try {
      await this.wrapped.update(exercise);
    } catch (err) {
      this.logError('update', err, { exerciseId: exercise.id });
      throw err;
    }
  }
}