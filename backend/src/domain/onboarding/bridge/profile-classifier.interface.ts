import { ClassificationResult } from '../value-objects/classification-result.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';

export interface ProfileClassifier {
  classify(answers: OnboardingAnswers): ClassificationResult;
}
