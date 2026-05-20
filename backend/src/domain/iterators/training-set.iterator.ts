import { Iterator } from './iterator.interface';
import { WorkoutComponent } from '../entities/workout-component';
import { TrainingSet } from '../entities/training-set';
import { ExerciseNode } from '../entities/exercise-node';

export class TrainingSetIterator implements Iterator<TrainingSet> {
  private sets: TrainingSet[] = [];
  private position: number = 0;

  constructor(components: ReadonlyArray<WorkoutComponent>) {
    this.flattenComponents(components);
  }

  private flattenComponents(components: ReadonlyArray<WorkoutComponent>): void {
    for (const component of components) {
      if (component instanceof TrainingSet) {
        this.sets.push(component);
      } else if (component instanceof ExerciseNode) {
        this.flattenComponents(component.getChildren());
      }
    }
  }

  public hasNext(): boolean {
    return this.position < this.sets.length;
  }

  public next(): TrainingSet {
    if (!this.hasNext()) {
      throw new Error('No more elements in iterator.');
    }
    const result = this.sets[this.position];
    this.position++;
    return result;
  }
}