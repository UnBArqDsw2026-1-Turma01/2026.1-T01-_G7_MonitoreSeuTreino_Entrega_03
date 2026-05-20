import { apiClient } from '../../../shared/lib/http/api-client';
import type {
  OnboardingStatusResponse,
  OnboardingProfile,
  SubmitOnboardingPayload,
} from '../types/onboarding.types';

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const { data } = await apiClient.get<OnboardingStatusResponse>('/v1/onboarding/me');
  return data;
}

export async function submitOnboarding(
  payload: SubmitOnboardingPayload,
): Promise<OnboardingProfile> {
  const { data } = await apiClient.post<OnboardingProfile>('/v1/onboarding', payload);
  return data;
}

export async function redoOnboarding(
  payload: SubmitOnboardingPayload,
): Promise<OnboardingProfile> {
  const { data } = await apiClient.put<OnboardingProfile>('/v1/onboarding', payload);
  return data;
}
