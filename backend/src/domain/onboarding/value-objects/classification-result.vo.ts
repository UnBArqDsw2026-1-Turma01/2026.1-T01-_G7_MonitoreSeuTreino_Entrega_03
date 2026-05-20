import { TrainingLevel } from '../enums/training-level.enum';

export class ClassificationResult {
  readonly classification: TrainingLevel;
  readonly score: number;

  private constructor(classification: TrainingLevel, score: number) {
    this.classification = classification;
    this.score = score;
  }

  static create(score: number): ClassificationResult {
    let classification: TrainingLevel;

    if (score <= 4) {
      classification = TrainingLevel.BEGINNER;
    } else if (score <= 8) {
      classification = TrainingLevel.INTERMEDIATE;
    } else {
      classification = TrainingLevel.ADVANCED;
    }

    return new ClassificationResult(classification, score);
  }

  static reconstitute(
    classification: TrainingLevel,
    score: number,
  ): ClassificationResult {
    return new ClassificationResult(classification, score);
  }
}
