import { ConsistencyLevel } from '../enums/consistency-level.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';

export class OnboardingClassificationRules {
  private static instance: OnboardingClassificationRules;

  private constructor() {}

  static getInstance(): OnboardingClassificationRules {
    if (!OnboardingClassificationRules.instance) {
      OnboardingClassificationRules.instance =
        new OnboardingClassificationRules();
    }
    return OnboardingClassificationRules.instance;
  }

  calculateScore(answers: OnboardingAnswers): number {
    return (
      this.scoreExperience(answers.experienceMonths) +
      this.scoreFrequency(answers.weeklyFrequency) +
      this.scoreStructuredPlan(answers.followedStructuredPlan) +
      this.scoreTechnique(answers.techniqueLevel) +
      this.scoreProgressiveLoad(answers.usesProgressiveLoad) +
      this.scoreConsistency(answers.recentConsistency)
    );
  }

  private scoreExperience(months: number): number {
    if (months < 6) return 0;
    if (months <= 18) return 1;
    return 2;
  }

  private scoreFrequency(frequency: number): number {
    if (frequency <= 2) return 0;
    if (frequency <= 4) return 1;
    return 2;
  }

  private scoreStructuredPlan(followed: boolean): number {
    return followed ? 1 : 0;
  }

  private scoreTechnique(level: TechniqueLevel): number {
    const map: Record<TechniqueLevel, number> = {
      [TechniqueLevel.LOW]: 0,
      [TechniqueLevel.MEDIUM]: 1,
      [TechniqueLevel.HIGH]: 2,
    };
    return map[level];
  }

  private scoreProgressiveLoad(uses: boolean): number {
    return uses ? 1 : 0;
  }

  private scoreConsistency(level: ConsistencyLevel): number {
    const map: Record<ConsistencyLevel, number> = {
      [ConsistencyLevel.LOW]: 0,
      [ConsistencyLevel.MEDIUM]: 1,
      [ConsistencyLevel.HIGH]: 2,
    };
    return map[level];
  }
}
