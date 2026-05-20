import { ConsistencyLevel } from '../enums/consistency-level.enum';
import { Sex } from '../enums/sex.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { TrainingGoal } from '../enums/training-goal.enum';
import { TrainingLevel } from '../enums/training-level.enum';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { FemaleProfileClassifier } from './female-profile-classifier';
import { MaleProfileClassifier } from './male-profile-classifier';
import { StrengthOnboardingFlow } from './strength-onboarding-flow';

const makeAnswers = (overrides: Partial<Parameters<typeof OnboardingAnswers.create>[0]> = {}) =>
  OnboardingAnswers.create({
    sex: Sex.MALE,
    age: 25,
    experienceMonths: 24,
    weeklyFrequency: 5,
    mainGoal: TrainingGoal.STRENGTH,
    followedStructuredPlan: true,
    techniqueLevel: TechniqueLevel.HIGH,
    usesProgressiveLoad: true,
    recentConsistency: ConsistencyLevel.HIGH,
    hasLimitation: false,
    ...overrides,
  });

describe('MaleProfileClassifier', () => {
  it('classifica perfil avançado corretamente', () => {
    const classifier = new MaleProfileClassifier();
    const result = classifier.classify(makeAnswers());
    expect(result.classification).toBe(TrainingLevel.ADVANCED);
    expect(result.score).toBe(10);
  });

  it('classifica perfil iniciante corretamente', () => {
    const classifier = new MaleProfileClassifier();
    const result = classifier.classify(
      makeAnswers({
        experienceMonths: 1,
        weeklyFrequency: 1,
        followedStructuredPlan: false,
        techniqueLevel: TechniqueLevel.LOW,
        usesProgressiveLoad: false,
        recentConsistency: ConsistencyLevel.LOW,
      }),
    );
    expect(result.classification).toBe(TrainingLevel.BEGINNER);
    expect(result.score).toBe(0);
  });
});

describe('FemaleProfileClassifier', () => {
  it('classifica perfil avançado corretamente', () => {
    const classifier = new FemaleProfileClassifier();
    const result = classifier.classify(makeAnswers({ sex: Sex.FEMALE }));
    expect(result.classification).toBe(TrainingLevel.ADVANCED);
    expect(result.score).toBe(10);
  });

  it('classifica perfil intermediário corretamente', () => {
    const classifier = new FemaleProfileClassifier();
    const result = classifier.classify(
      makeAnswers({
        sex: Sex.FEMALE,
        experienceMonths: 12,
        weeklyFrequency: 3,
        followedStructuredPlan: true,
        techniqueLevel: TechniqueLevel.HIGH,
        usesProgressiveLoad: true,
        recentConsistency: ConsistencyLevel.LOW,
      }),
    );
    expect(result.classification).toBe(TrainingLevel.INTERMEDIATE);
  });
});

describe('StrengthOnboardingFlow (Bridge)', () => {
  it('executa o fluxo usando o classificador injetado', () => {
    const classifier = new MaleProfileClassifier();
    const flow = new StrengthOnboardingFlow(classifier);
    const answers = makeAnswers();
    const result = flow.execute(answers);
    expect(result.classification).toBe(TrainingLevel.ADVANCED);
  });

  it('bridge permite trocar classificador sem mudar o fluxo', () => {
    const maleClassifier = new MaleProfileClassifier();
    const femaleClassifier = new FemaleProfileClassifier();

    const maleFlow = new StrengthOnboardingFlow(maleClassifier);
    const femaleFlow = new StrengthOnboardingFlow(femaleClassifier);

    const answers = makeAnswers({ sex: Sex.FEMALE });
    const maleResult = maleFlow.execute(answers);
    const femaleResult = femaleFlow.execute(answers);

    expect(maleResult.score).toBe(femaleResult.score);
  });
});
