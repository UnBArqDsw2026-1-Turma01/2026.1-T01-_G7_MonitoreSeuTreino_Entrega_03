import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { OnboardingAnswersProps } from '@domain/onboarding/value-objects/onboarding-answers.vo';
import {
  GetMyOnboardingUseCase,
  OnboardingStatus,
} from '@application/use-cases/onboarding/get-my-onboarding.use-case';
import { RedoOnboardingUseCase } from '@application/use-cases/onboarding/redo-onboarding.use-case';
import { SubmitOnboardingUseCase } from '@application/use-cases/onboarding/submit-onboarding.use-case';

export class OnboardingFacade {
  constructor(
    private readonly getMyOnboarding: GetMyOnboardingUseCase,
    private readonly submitOnboarding: SubmitOnboardingUseCase,
    private readonly redoOnboarding: RedoOnboardingUseCase,
  ) {}

  getStatus(userId: string): Promise<OnboardingStatus> {
    return this.getMyOnboarding.execute({ userId });
  }

  submit(
    userId: string,
    answers: OnboardingAnswersProps,
  ): Promise<TrainingProfile> {
    return this.submitOnboarding.execute({ userId, answers });
  }

  redo(
    userId: string,
    answers: OnboardingAnswersProps,
  ): Promise<TrainingProfile> {
    return this.redoOnboarding.execute({ userId, answers });
  }
}
