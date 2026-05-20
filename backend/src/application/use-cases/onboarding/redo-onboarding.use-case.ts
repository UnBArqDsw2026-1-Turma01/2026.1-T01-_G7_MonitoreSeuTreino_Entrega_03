import { FemaleProfileClassifier } from '@domain/onboarding/bridge/female-profile-classifier';
import { MaleProfileClassifier } from '@domain/onboarding/bridge/male-profile-classifier';
import { StrengthOnboardingFlow } from '@domain/onboarding/bridge/strength-onboarding-flow';
import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { Sex } from '@domain/onboarding/enums/sex.enum';
import { OnboardingHistoryRepository } from '@domain/onboarding/repositories/onboarding-history.repository';
import { TrainingProfileRepository } from '@domain/onboarding/repositories/training-profile.repository';
import {
  OnboardingAnswers,
  OnboardingAnswersProps,
} from '@domain/onboarding/value-objects/onboarding-answers.vo';
import { NotFoundException } from '@domain/exceptions/domain-exceptions';

export interface RedoOnboardingCommand {
  userId: string;
  answers: OnboardingAnswersProps;
}

export class RedoOnboardingUseCase {
  constructor(
    private readonly trainingProfileRepository: TrainingProfileRepository,
    private readonly onboardingHistoryRepository: OnboardingHistoryRepository,
  ) {}

  async execute(cmd: RedoOnboardingCommand): Promise<TrainingProfile> {
    const existing = await this.trainingProfileRepository.findByUserId(
      cmd.userId,
    );
    if (!existing) {
      throw new NotFoundException(
        'No onboarding found. Use POST to submit first.',
      );
    }

    const memento = existing.createMemento();
    await this.onboardingHistoryRepository.save(memento);

    const answers = OnboardingAnswers.create(cmd.answers);
    const classifier =
      answers.sex === Sex.MALE
        ? new MaleProfileClassifier()
        : new FemaleProfileClassifier();
    const flow = new StrengthOnboardingFlow(classifier);
    const result = flow.execute(answers);

    const updated = existing.update(answers, result);
    await this.trainingProfileRepository.save(updated);
    return updated;
  }
}
