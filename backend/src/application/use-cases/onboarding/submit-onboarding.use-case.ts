import { FemaleProfileClassifier } from '@domain/onboarding/bridge/female-profile-classifier';
import { MaleProfileClassifier } from '@domain/onboarding/bridge/male-profile-classifier';
import { StrengthOnboardingFlow } from '@domain/onboarding/bridge/strength-onboarding-flow';
import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { Sex } from '@domain/onboarding/enums/sex.enum';
import { TrainingProfileRepository } from '@domain/onboarding/repositories/training-profile.repository';
import {
  OnboardingAnswers,
  OnboardingAnswersProps,
} from '@domain/onboarding/value-objects/onboarding-answers.vo';
import { ConflictException } from '@domain/exceptions/domain-exceptions';

export interface SubmitOnboardingCommand {
  userId: string;
  answers: OnboardingAnswersProps;
}

export class SubmitOnboardingUseCase {
  constructor(
    private readonly trainingProfileRepository: TrainingProfileRepository,
  ) {}

  async execute(cmd: SubmitOnboardingCommand): Promise<TrainingProfile> {
    const existing = await this.trainingProfileRepository.findByUserId(
      cmd.userId,
    );
    if (existing) {
      throw new ConflictException(
        'Onboarding already completed. Use PUT to redo.',
      );
    }

    const answers = OnboardingAnswers.create(cmd.answers);
    const classifier =
      answers.sex === Sex.MALE
        ? new MaleProfileClassifier()
        : new FemaleProfileClassifier();
    const flow = new StrengthOnboardingFlow(classifier);
    const result = flow.execute(answers);

    const profile = TrainingProfile.create(cmd.userId, answers, result);
    await this.trainingProfileRepository.save(profile);
    return profile;
  }
}
