import { TrainingSession, SessionState } from '../entities/training-session';
import { randomUUID } from 'crypto';

export class TrainingSessionBuilder {
  private id: string;
  private userId: string;
  private date: Date;
  private routineId: string | null = null;
  
  private componentsBuilder: any[] = [];

  constructor(userId: string) {
    this.id = randomUUID();
    this.userId = userId;
    this.date = new Date();
  }

  public withCustomId(id: string): this {
    this.id = id;
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
}