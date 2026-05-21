export interface SessionHistorySummary {
  sessionId: string;
  date: Date;
  routineId: string | null;
  exerciseCount: number;
}

export interface SessionHistorySetDetail {
  id: string;
  targetReps: number;
  actualReps: number | null;
  weight: number | null;
  observations: string | null;
}

export interface SessionHistoryExerciseDetail {
  id: string;
  exerciseId: string;
  expectedSets: number;
  sets: SessionHistorySetDetail[];
}

export interface SessionHistoryDetail extends SessionHistorySummary {
  totalVolume: number;
  exercises: SessionHistoryExerciseDetail[];
}

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Contrato do serviço de histórico.
 * A implementação exposta ao Nest é o Proxy (HistoryServiceProxy),
 * que delega ao HistoryService (serviço real).
 */
export interface IHistoryService {
  listCompletedSessions(
    authenticatedUserId: string,
    filter?: DateRangeFilter,
  ): Promise<SessionHistorySummary[]>;

  getSessionDetail(
    authenticatedUserId: string,
    sessionId: string,
  ): Promise<SessionHistoryDetail>;
}

export const HISTORY_SERVICE = Symbol('IHistoryService');
