import { Sex } from '../enums/sex.enum';
import { TrainingGoal } from '../enums/training-goal.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { ConsistencyLevel } from '../enums/consistency-level.enum';

export interface OnboardingAnswersProps {
  sex: Sex;
  age: number;
  experienceMonths: number;
  weeklyFrequency: number;
  mainGoal: TrainingGoal;
  followedStructuredPlan: boolean;
  techniqueLevel: TechniqueLevel;
  usesProgressiveLoad: boolean;
  recentConsistency: ConsistencyLevel;
  hasLimitation: boolean;
}

export class OnboardingAnswers {
  readonly sex: Sex;
  readonly age: number;
  readonly experienceMonths: number;
  readonly weeklyFrequency: number;
  readonly mainGoal: TrainingGoal;
  readonly followedStructuredPlan: boolean;
  readonly techniqueLevel: TechniqueLevel;
  readonly usesProgressiveLoad: boolean;
  readonly recentConsistency: ConsistencyLevel;
  readonly hasLimitation: boolean;

  private constructor(props: OnboardingAnswersProps) {
    this.sex = props.sex;
    this.age = props.age;
    this.experienceMonths = props.experienceMonths;
    this.weeklyFrequency = props.weeklyFrequency;
    this.mainGoal = props.mainGoal;
    this.followedStructuredPlan = props.followedStructuredPlan;
    this.techniqueLevel = props.techniqueLevel;
    this.usesProgressiveLoad = props.usesProgressiveLoad;
    this.recentConsistency = props.recentConsistency;
    this.hasLimitation = props.hasLimitation;
  }

  static create(props: OnboardingAnswersProps): OnboardingAnswers {
    if (props.age < 10 || props.age > 120) {
      throw new Error('Age must be between 10 and 120');
    }
    if (props.experienceMonths < 0) {
      throw new Error('Experience months cannot be negative');
    }
    if (props.weeklyFrequency < 1 || props.weeklyFrequency > 7) {
      throw new Error('Weekly frequency must be between 1 and 7');
    }
    return new OnboardingAnswers(props);
  }

  toPlainObject(): OnboardingAnswersProps {
    return {
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
    };
  }
}
