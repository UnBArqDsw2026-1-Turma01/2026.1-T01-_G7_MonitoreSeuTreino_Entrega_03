import { OnboardingClassificationRules } from '../rules/onboarding-classification-rules.singleton';
import { ClassificationResult } from '../value-objects/classification-result.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { ProfileClassifier } from './profile-classifier.interface';

export class FemaleProfileClassifier implements ProfileClassifier {
  private readonly rules = OnboardingClassificationRules.getInstance();

  classify(answers: OnboardingAnswers): ClassificationResult {
    const score = this.rules.calculateScore(answers);
    return ClassificationResult.create(score);
  }
}
