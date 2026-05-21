import { TrainingSession } from '../entities/training-session';

export interface SessionDateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface ITrainingSessionRepository {
  save(session: TrainingSession): Promise<void>;
  findById(id: string): Promise<TrainingSession | null>;
  findByUserId(userId: string): Promise<TrainingSession[]>;
  findCompletedByUserId(
    userId: string,
    filter?: SessionDateRangeFilter,
  ): Promise<TrainingSession[]>;
}

export const TRAINING_SESSION_REPOSITORY = Symbol('ITrainingSessionRepository');