import { WorkoutComponent } from './workout-component';

export class TrainingSet implements WorkoutComponent {
  constructor(
    public readonly id: string,
    public readonly targetReps: number,
    public readonly actualReps: number | null,
    public readonly weight: number | null,
    public readonly observations: string | null,
  ) {}

  public getVolume(): number {
    if (!this.actualReps) {
      return 0;
    }
    
    if (this.weight && this.weight > 0) {
      return this.actualReps * this.weight;
    }

    return this.actualReps;
  }

  public getTotalReps(): number {
    return this.actualReps || 0;
  }
}