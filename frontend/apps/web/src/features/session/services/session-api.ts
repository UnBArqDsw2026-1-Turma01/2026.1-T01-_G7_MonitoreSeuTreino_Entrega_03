import { apiClient } from '../../../shared/lib/http/api-client';

export async function startSession(payload: unknown) {
  const { data } = await apiClient.post('/sessions/start', payload);
  return data;
}
