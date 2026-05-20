import { ConsistencyLevel } from '../enums/consistency-level.enum';
import { Sex } from '../enums/sex.enum';
import { TechniqueLevel } from '../enums/technique-level.enum';
import { TrainingGoal } from '../enums/training-goal.enum';
import { TrainingLevel } from '../enums/training-level.enum';
import { ClassificationResult } from '../value-objects/classification-result.vo';
import { OnboardingAnswers } from '../value-objects/onboarding-answers.vo';
import { TrainingProfile } from './training-profile.entity';

function makeProfile(): TrainingProfile {
  const answers = OnboardingAnswers.create({
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
  });
  const result = ClassificationResult.create(10);
  return TrainingProfile.create('user-123', answers, result);
}

describe('TrainingProfile (Memento)', () => {
  it('createMemento preserva o estado anterior do perfil', () => {
    const profile = makeProfile();
    const memento = profile.createMemento();

    expect(memento.trainingProfileId).toBe(profile.id);
    expect(memento.userId).toBe(profile.userId);
    expect(memento.classification).toBe(TrainingLevel.ADVANCED);
    expect(memento.score).toBe(10);
    expect(memento.answersSnapshot.sex).toBe(Sex.MALE);
    expect(memento.answersSnapshot.experienceMonths).toBe(24);
  });

  it('o snapshot do memento não é afetado por atualização posterior do perfil', () => {
    const profile = makeProfile();
    const memento = profile.createMemento();

    const newAnswers = OnboardingAnswers.create({
      sex: Sex.MALE,
      age: 25,
      experienceMonths: 1,
      weeklyFrequency: 1,
      mainGoal: TrainingGoal.FITNESS,
      followedStructuredPlan: false,
      techniqueLevel: TechniqueLevel.LOW,
      usesProgressiveLoad: false,
      recentConsistency: ConsistencyLevel.LOW,
      hasLimitation: true,
    });
    const newResult = ClassificationResult.create(0);
    const updated = profile.update(newAnswers, newResult);

    expect(memento.score).toBe(10);
    expect(updated.score).toBe(0);
    expect(memento.answersSnapshot.experienceMonths).toBe(24);
  });

  it('perfil atualizado mantém o mesmo id', () => {
    const profile = makeProfile();
    const newAnswers = OnboardingAnswers.create({
      sex: Sex.FEMALE,
      age: 30,
      experienceMonths: 6,
      weeklyFrequency: 3,
      mainGoal: TrainingGoal.WEIGHT_LOSS,
      followedStructuredPlan: true,
      techniqueLevel: TechniqueLevel.MEDIUM,
      usesProgressiveLoad: false,
      recentConsistency: ConsistencyLevel.MEDIUM,
      hasLimitation: false,
    });
    const result = ClassificationResult.create(5);
    const updated = profile.update(newAnswers, result);

    expect(updated.id).toBe(profile.id);
    expect(updated.userId).toBe(profile.userId);
    expect(updated.classification).toBe(TrainingLevel.INTERMEDIATE);
  });
});
