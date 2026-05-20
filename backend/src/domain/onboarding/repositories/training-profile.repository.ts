import { TrainingProfile } from '../entities/training-profile.entity';

export const TRAINING_PROFILE_REPOSITORY = Symbol('TRAINING_PROFILE_REPOSITORY');

export interface TrainingProfileRepository {
  save(profile: TrainingProfile): Promise<void>;
  findByUserId(userId: string): Promise<TrainingProfile | null>;
}
