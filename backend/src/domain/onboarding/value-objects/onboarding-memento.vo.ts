import { TrainingLevel } from '../enums/training-level.enum';
import { OnboardingAnswersProps } from './onboarding-answers.vo';

export class OnboardingMemento {
  readonly trainingProfileId: string;
  readonly userId: string;
  readonly answersSnapshot: OnboardingAnswersProps;
  readonly classification: TrainingLevel;
  readonly score: number;
  readonly capturedAt: Date;

  constructor(
    trainingProfileId: string,
    userId: string,
    answersSnapshot: OnboardingAnswersProps,
    classification: TrainingLevel,
    score: number,
  ) {
    this.trainingProfileId = trainingProfileId;
    this.userId = userId;
    this.answersSnapshot = { ...answersSnapshot };
    this.classification = classification;
    this.score = score;
    this.capturedAt = new Date();
  }
}
