import { randomUUID } from 'crypto';
import { Sex } from '../enums/sex.enum';
import { TrainingLevel } from '../enums/training-level.enum';
import { TrainingGoal } from '../enums/training-goal.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { ConsistencyLevel } from '../enums/consistency-level.enum';
import { OnboardingMemento } from '../value-objects/onboarding-memento.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { ClassificationResult } from '../value-objects/classification-result.vo';

export class TrainingProfile {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly sex: Sex,
    public readonly age: number,
    public readonly experienceMonths: number,
    public readonly weeklyFrequency: number,
    public readonly mainGoal: TrainingGoal,
    public readonly followedStructuredPlan: boolean,
    public readonly techniqueLevel: TechniqueLevel,
    public readonly usesProgressiveLoad: boolean,
    public readonly recentConsistency: ConsistencyLevel,
    public readonly hasLimitation: boolean,
    public readonly classification: TrainingLevel,
    public readonly score: number,
    public readonly completedAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    userId: string,
    answers: OnboardingAnswers,
    result: ClassificationResult,
  ): TrainingProfile {
    const now = new Date();
    return new TrainingProfile(
      randomUUID(),
      userId,
      answers.sex,
      answers.age,
      answers.experienceMonths,
      answers.weeklyFrequency,
      answers.mainGoal,
      answers.followedStructuredPlan,
      answers.techniqueLevel,
      answers.usesProgressiveLoad,
      answers.recentConsistency,
      answers.hasLimitation,
      result.classification,
      result.score,
      now,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    userId: string,
    sex: Sex,
    age: number,
    experienceMonths: number,
    weeklyFrequency: number,
    mainGoal: TrainingGoal,
    followedStructuredPlan: boolean,
    techniqueLevel: TechniqueLevel,
    usesProgressiveLoad: boolean,
    recentConsistency: ConsistencyLevel,
    hasLimitation: boolean,
    classification: TrainingLevel,
    score: number,
    completedAt: Date,
    createdAt: Date,
    updatedAt: Date,
  ): TrainingProfile {
    return new TrainingProfile(
      id,
      userId,
      sex,
      age,
      experienceMonths,
      weeklyFrequency,
      mainGoal,
      followedStructuredPlan,
      techniqueLevel,
      usesProgressiveLoad,
      recentConsistency,
      hasLimitation,
      classification,
      score,
      completedAt,
      createdAt,
      updatedAt,
    );
  }

  update(
    answers: OnboardingAnswers,
    result: ClassificationResult,
  ): TrainingProfile {
    const now = new Date();
    return new TrainingProfile(
      this.id,
      this.userId,
      answers.sex,
      answers.age,
      answers.experienceMonths,
      answers.weeklyFrequency,
      answers.mainGoal,
      answers.followedStructuredPlan,
      answers.techniqueLevel,
      answers.usesProgressiveLoad,
      answers.recentConsistency,
      answers.hasLimitation,
      result.classification,
      result.score,
      now,
      this.createdAt,
      now,
    );
  }

  createMemento(): OnboardingMemento {
    return new OnboardingMemento(
      this.id,
      this.userId,
      {
        sex: this.sex,
        age: this.age,
        experienceMonths: this.experienceMonths,
        weeklyFrequency: this.weeklyFrequency,
        mainGoal: this.mainGoal,
        followedStructuredPlan: this.followedStructuredPlan,
        techniqueLevel: this.techniqueLevel,
        usesProgressiveLoad: this.usesProgressiveLoad,
        recentConsistency: this.recentConsistency,
        hasLimitation: this.hasLimitation,
      },
      this.classification,
      this.score,
    );
  }

  toAnswers(): OnboardingAnswers {
    return OnboardingAnswers.create({
      sex: this.sex,
      age: this.age,
      experienceMonths: this.experienceMonths,
      weeklyFrequency: this.weeklyFrequency,
      mainGoal: this.mainGoal,
      followedStructuredPlan: this.followedStructuredPlan,
      techniqueLevel: this.techniqueLevel,
      usesProgressiveLoad: this.usesProgressiveLoad,
      recentConsistency: this.recentConsistency,
      hasLimitation: this.hasLimitation,
    });
  }
}
