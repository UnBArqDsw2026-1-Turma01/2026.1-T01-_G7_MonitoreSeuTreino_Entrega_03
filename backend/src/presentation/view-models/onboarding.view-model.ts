import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import { OnboardingStatus } from '@application/use-cases/onboarding/get-my-onboarding.use-case';

export class OnboardingViewModel {
  static toResponse(profile: TrainingProfile) {
    return {
      id: profile.id,
      userId: profile.userId,
      sex: profile.sex,
      age: profile.age,
      experienceMonths: profile.experienceMonths,
      weeklyFrequency: profile.weeklyFrequency,
      mainGoal: profile.mainGoal,
      followedStructuredPlan: profile.followedStructuredPlan,
      techniqueLevel: profile.techniqueLevel,
      usesProgressiveLoad: profile.usesProgressiveLoad,
      recentConsistency: profile.recentConsistency,
      hasLimitation: profile.hasLimitation,
      classification: profile.classification,
      score: profile.score,
      completedAt: profile.completedAt.toISOString(),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    };
  }

  static toStatusResponse(status: OnboardingStatus) {
    return {
      completed: status.completed,
      profile: status.profile ? OnboardingViewModel.toResponse(status.profile) : null,
    };
  }
}
