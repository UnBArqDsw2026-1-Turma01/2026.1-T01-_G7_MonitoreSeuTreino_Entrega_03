import { TrainingSession, SessionState } from '../entities/training-session';
import { ExerciseNode } from '../entities/exercise-node';
import { TrainingSet } from '../entities/training-set';
import { randomUUID } from 'crypto';

export class TrainingSessionBuilder {
  private id: string;
  private userId: string;
  private date: Date;
  private routineId: string | null = null;
  
  private exerciseNodes: Map<string, ExerciseNode> = new Map();

  constructor(userId: string) {
    this.id = randomUUID();
    this.userId = userId;
    this.date = new Date();
  }

  public withCustomId(id: string): this {
    return this;
  }

  public withDate(date: Date): this {
    this.date = date;
    return this;
  }

  public withRoutine(routineId: string): this {
    this.routineId = routineId;
    return this;
  }

  public addExercise(exerciseId: string, expectedSets: number, nodeId: string = randomUUID()): this {
    const exerciseNode = new ExerciseNode(nodeId, exerciseId, expectedSets);
    this.exerciseNodes.set(nodeId, exerciseNode);
    return this;
  }

  public addSetToExercise(
    nodeId: string,
    targetReps: number,
    actualReps: number | null,
    weight: number | null,
    observations: string | null = null,
  ): this {
    const exerciseNode = this.exerciseNodes.get(nodeId);
    
    if (!exerciseNode) {
      throw new Error(`Exercicio com ID ${nodeId} não encontrado no buider.`);
    }

    const setId = randomUUID();
    const trainingSet = new TrainingSet(setId, targetReps, actualReps, weight, observations);
    
    exerciseNode.add(trainingSet);

    return this;
  }

  public build(): TrainingSession {
    if (this.exerciseNodes.size === 0) {
      throw new Error('Uma sessão de treino deve ter pelo menos um exercício.');
    }

    const session = new TrainingSession(
      this.id,
      this.userId,
      this.date,
      SessionState.COMPLETED,
      this.routineId,
    );

    for (const [_, exerciseNode] of this.exerciseNodes) {
      session.addWorkoutComponent(exerciseNode);
    }

    return session;
  }
}