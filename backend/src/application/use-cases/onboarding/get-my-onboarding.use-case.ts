import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { TrainingProfileRepository } from '@domain/onboarding/repositories/training-profile.repository';

export interface GetMyOnboardingQuery {
  userId: string;
}

export interface OnboardingStatus {
  completed: boolean;
  profile: TrainingProfile | null;
}

export class GetMyOnboardingUseCase {
  constructor(
    private readonly trainingProfileRepository: TrainingProfileRepository,
  ) {}

  async execute(query: GetMyOnboardingQuery): Promise<OnboardingStatus> {
    const profile = await this.trainingProfileRepository.findByUserId(
      query.userId,
    );
    return { completed: profile !== null, profile };
  }
}
