import {
  SessionHistoryDetail,
  SessionHistorySummary,
} from '@domain/history/services/i-history.service';

export class SessionHistoryViewModel {
  /** RF26 — item da listagem */
  static toListItem(summary: SessionHistorySummary) {
    return {
      sessionId: summary.sessionId,
      date: summary.date.toISOString(),
      routineId: summary.routineId,
      exerciseCount: summary.exerciseCount,
    };
  }

  static toListResponse(summaries: SessionHistorySummary[]) {
    return {
      sessions: summaries.map((s) => SessionHistoryViewModel.toListItem(s)),
    };
  }

  /** RF26 — detalhes completos ao selecionar uma sessão */
  static toDetailResponse(detail: SessionHistoryDetail) {
    return {
      sessionId: detail.sessionId,
      date: detail.date.toISOString(),
      routineId: detail.routineId,
      exerciseCount: detail.exerciseCount,
      totalVolume: detail.totalVolume,
      exercises: detail.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        expectedSets: ex.expectedSets,
        sets: ex.sets.map((set) => ({
          id: set.id,
          targetReps: set.targetReps,
          actualReps: set.actualReps,
          weight: set.weight,
          observations: set.observations,
        })),
      })),
    };
  }
}
