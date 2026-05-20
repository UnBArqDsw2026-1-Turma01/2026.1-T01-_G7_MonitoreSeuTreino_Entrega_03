import { ConsistencyLevel } from '../enums/consistency-level.enum';
import { Sex } from '../enums/sex.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { TrainingGoal } from '../enums/training-goal.enum';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { OnboardingClassificationRules } from './onboarding-classification-rules.singleton';

const baseAnswers = {
  sex: Sex.MALE,
  age: 25,
  mainGoal: TrainingGoal.HYPERTROPHY,
  hasLimitation: false,
};

describe('OnboardingClassificationRules (Singleton)', () => {
  it('sempre retorna a mesma instância', () => {
    const a = OnboardingClassificationRules.getInstance();
    const b = OnboardingClassificationRules.getInstance();
    expect(a).toBe(b);
  });

  it('calcula pontuação 0 para perfil iniciante mínimo', () => {
    const rules = OnboardingClassificationRules.getInstance();
    const answers = OnboardingAnswers.create({
      ...baseAnswers,
      experienceMonths: 3,
      weeklyFrequency: 1,
      followedStructuredPlan: false,
      techniqueLevel: TechniqueLevel.LOW,
      usesProgressiveLoad: false,
      recentConsistency: ConsistencyLevel.LOW,
    });
    expect(rules.calculateScore(answers)).toBe(0);
  });

  it('calcula pontuação 10 para perfil avançado máximo', () => {
    const rules = OnboardingClassificationRules.getInstance();
    const answers = OnboardingAnswers.create({
      ...baseAnswers,
      experienceMonths: 24,
      weeklyFrequency: 5,
      followedStructuredPlan: true,
      techniqueLevel: TechniqueLevel.HIGH,
      usesProgressiveLoad: true,
      recentConsistency: ConsistencyLevel.HIGH,
    });
    expect(rules.calculateScore(answers)).toBe(10);
  });

  it('calcula pontuação 6 para perfil intermediário', () => {
    const rules = OnboardingClassificationRules.getInstance();
    const answers = OnboardingAnswers.create({
      ...baseAnswers,
      experienceMonths: 12,
      weeklyFrequency: 3,
      followedStructuredPlan: true,
      techniqueLevel: TechniqueLevel.HIGH,
      usesProgressiveLoad: true,
      recentConsistency: ConsistencyLevel.LOW,
    });
    expect(rules.calculateScore(answers)).toBe(6);
  });

  it('pontua corretamente experiência < 6 meses como 0', () => {
    const rules = OnboardingClassificationRules.getInstance();
    const answers = OnboardingAnswers.create({
      ...baseAnswers,
      experienceMonths: 5,
      weeklyFrequency: 5,
      followedStructuredPlan: true,
      techniqueLevel: TechniqueLevel.HIGH,
      usesProgressiveLoad: true,
      recentConsistency: ConsistencyLevel.HIGH,
    });
    expect(rules.calculateScore(answers)).toBe(8);
  });

  it('pontua corretamente experiência 6-18 meses como 1', () => {
    const rules = OnboardingClassificationRules.getInstance();
    const answers = OnboardingAnswers.create({
      ...baseAnswers,
      experienceMonths: 12,
      weeklyFrequency: 1,
      followedStructuredPlan: false,
      techniqueLevel: TechniqueLevel.LOW,
      usesProgressiveLoad: false,
      recentConsistency: ConsistencyLevel.LOW,
    });
    expect(rules.calculateScore(answers)).toBe(1);
  });
});
