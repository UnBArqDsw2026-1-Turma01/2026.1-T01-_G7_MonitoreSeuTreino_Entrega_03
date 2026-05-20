import { ClassificationResult } from '../value-objects/classification-result.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { OnboardingFlow } from './onboarding-flow.abstract';
import { ProfileClassifier } from './profile-classifier.interface';

export class StrengthOnboardingFlow extends OnboardingFlow {
  constructor(classifier: ProfileClassifier) {
    super(classifier);
  }

  protected override beforeClassify(_answers: OnboardingAnswers): void {}

  protected override afterClassify(_result: ClassificationResult): void {}
}
