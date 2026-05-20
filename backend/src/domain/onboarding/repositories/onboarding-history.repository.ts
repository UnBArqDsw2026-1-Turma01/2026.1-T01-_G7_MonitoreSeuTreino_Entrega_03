import { OnboardingMemento } from '../value-objects/onboarding-memento.vo';

export const ONBOARDING_HISTORY_REPOSITORY = Symbol(
  'ONBOARDING_HISTORY_REPOSITORY',
);

export interface OnboardingHistoryRepository {
  save(memento: OnboardingMemento): Promise<void>;
  findByUserId(userId: string): Promise<OnboardingMemento[]>;
}
