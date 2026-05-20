import { TrainingSession } from '../entities/training-session';

export interface ITrainingSessionRepository {
  save(session: TrainingSession): Promise<void>;
  findById(id: string): Promise<TrainingSession | null>;
  findByUserId(userId: string): Promise<TrainingSession[]>;
}

export const TRAINING_SESSION_REPOSITORY = Symbol('ITrainingSessionRepository');