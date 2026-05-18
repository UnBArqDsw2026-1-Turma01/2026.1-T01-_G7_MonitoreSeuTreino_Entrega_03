import { useMutation } from '@tanstack/react-query';
import { startSession } from '../services/session-api';

export function useStartSession() {
  return useMutation({
    mutationFn: startSession,
  });
}
