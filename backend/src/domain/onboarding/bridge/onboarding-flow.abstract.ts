import { ClassificationResult } from '../value-objects/classification-result.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { ProfileClassifier } from './profile-classifier.interface';

export abstract class OnboardingFlow {
  constructor(protected readonly classifier: ProfileClassifier) {}

  execute(answers: OnboardingAnswers): ClassificationResult {
    this.beforeClassify(answers);
    const result = this.classifier.classify(answers);
    this.afterClassify(result);
    return result;
  }

  protected beforeClassify(_answers: OnboardingAnswers): void {}

  protected afterClassify(_result: ClassificationResult): void {}
}
