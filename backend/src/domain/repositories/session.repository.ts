export interface SessionRepository {
  hasCompletedSessions(routineId: string): Promise<boolean>;
}

export const SESSION_REPOSITORY_TOKEN = Symbol('SessionRepository');