import { apiClient } from '../../../shared/lib/http/api-client';
import type { WeeklySummary, WeeklySummaryParams } from '../types/tracking.types';

function normalizeWeeklySummaryParams(params?: WeeklySummaryParams) {
  return {
    weekOffset: params?.weekOffset ?? 0,
  };
}

export async function getWeeklySummary(
  params?: WeeklySummaryParams,
): Promise<WeeklySummary> {
  const { data } = await apiClient.get<WeeklySummary>(
    '/v1/tracking/weekly-summary',
    {
      params: normalizeWeeklySummaryParams(params),
    },
  );

  return data;
}