import { WorkoutComponent } from './workout-component';

export class ExerciseNode implements WorkoutComponent {
  private readonly children: WorkoutComponent[] = [];

  constructor(
    public readonly id: string,
    public readonly exerciseId: string,
    public readonly expectedSets: number,
  ) {}

  public add(component: WorkoutComponent): void {
    this.children.push(component);
  }

  public remove(component: WorkoutComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  public getChildren(): ReadonlyArray<WorkoutComponent> {
    return this.children;
  }

  public getVolume(): number {
    return this.children.reduce((total, child) => total + child.getVolume(), 0);
  }

  public getTotalReps(): number {
    return this.children.reduce((total, child) => total + child.getTotalReps(), 0);
  }
}