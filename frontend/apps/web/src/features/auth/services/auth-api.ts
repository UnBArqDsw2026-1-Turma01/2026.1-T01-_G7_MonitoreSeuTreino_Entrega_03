import { apiClient } from '../../../shared/lib/http/api-client';
import { useAuthStore } from '../store/auth-store';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string };
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/v1/auth/login', payload);
  useAuthStore.getState().setToken(data.accessToken);
  return data;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post('/v1/auth/signup', payload);
}

export function logout(): void {
  useAuthStore.getState().clearToken();
  window.location.href = '/login';
}
