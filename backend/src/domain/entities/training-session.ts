import { AggregateRoot } from './aggregate-root';
import { WorkoutComponent } from './workout-component';
import { TrainingSetIterator } from '../iterators/training-set.iterator';
import { TrainingSet } from './training-set';
import { Iterator } from '../iterators/iterator.interface';

export enum SessionState {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
}

export class TrainingSession extends AggregateRoot {
  private components: WorkoutComponent[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: Date,
    private state: SessionState,
    public readonly routineId: string | null = null,
  ) {
    super();
  }

  public addWorkoutComponent(component: WorkoutComponent): void {
    this.components.push(component);
  }

  public getComponents(): ReadonlyArray<WorkoutComponent> {
    return this.components;
  }

  public isCompleted(): boolean {
    return this.state === SessionState.COMPLETED;
  }

  public markAsCompleted(): void {
    this.state = SessionState.COMPLETED;
    // TODO: adicionar o push do evento 
  }

  public getSessionTotalVolume(): number {
    return this.components.reduce((total, comp) => total + comp.getVolume(), 0);
  }

  public createSetIterator(): Iterator<TrainingSet> {
    return new TrainingSetIterator(this.components);
  }
}