import { apiClient } from '../../../shared/lib/http/api-client';
import type {
  RegisterSessionPayload,
  SessionHistorySummary,
  SessionHistoryDetail,
} from '../types/session.types';

export async function registerSession(payload: RegisterSessionPayload): Promise<void> {
  await apiClient.post('/v1/sessions', payload);
}

export async function getSessionHistory(): Promise<{ sessions: SessionHistorySummary[] }> {
  const { data } = await apiClient.get<{ sessions: SessionHistorySummary[] }>('/v1/history/sessions');
  return data;
}

export async function getSessionHistoryDetail(sessionId: string): Promise<SessionHistoryDetail> {
  const { data } = await apiClient.get<SessionHistoryDetail>(`/v1/history/sessions/${sessionId}`);
  return data;
}

// Mantido por retrocompatibilidade caso alguma rota ou arquivo de testes dependa dele
export async function startSession(payload: unknown) {
  const { data } = await apiClient.post('/sessions/start', payload);
  return data;
}
