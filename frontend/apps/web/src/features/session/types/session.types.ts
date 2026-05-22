export interface TrainingSet {
  targetReps: number;
  actualReps?: number | null;
  weight?: number | null;
  observations?: string;
}

export interface ExerciseNode {
  exerciseId: string;
  expectedSets: number;
  sets: TrainingSet[];
}

export interface RegisterSessionPayload {
  date?: string; // ISO 8601 string
  routineId?: string;
  exercises: ExerciseNode[];
}

export interface SessionHistorySummary {
  sessionId: string;
  date: string; // ISO string
  routineId: string | null;
  exerciseCount: number;
}

export interface SessionHistoryDetail {
  sessionId: string;
  date: string; // ISO string
  routineId: string | null;
  exerciseCount: number;
  totalVolume: number;
  exercises: {
    id: string;
    exerciseId: string;
    expectedSets: number;
    sets: {
      id: string;
      targetReps: number;
      actualReps: number | null;
      weight: number | null;
      observations?: string;
    }[];
  }[];
}
