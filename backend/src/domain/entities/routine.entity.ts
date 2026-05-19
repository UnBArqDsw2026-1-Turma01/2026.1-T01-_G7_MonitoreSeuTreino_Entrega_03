import { AggregateRoot } from './aggregate-root';
import { RoutineId } from '../value-objects/routine-id.vo';
import { RoutineName } from '../value-objects/routine-name.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Timestamp } from '../value-objects/timestamp.vo';
import { RoutineCreatedEvent, RoutineClonedEvent } from '../events/routine-events';

export interface ExerciseParam {
  exerciseId: string;
  targetSets: number;
  targetReps: string;
  notes?: string;
}

export interface RoutineDivision {
  name: string;
  exercises: ExerciseParam[];
}

export class Routine extends AggregateRoot {
  private constructor(
    public readonly id: RoutineId,
    public readonly userId: UserId,
    public readonly name: RoutineName,
    public readonly divisions: RoutineDivision[],
    public readonly isActive: boolean,
    public readonly createdAt: Timestamp,
    public readonly updatedAt: Timestamp,
    public readonly deletedAt: Timestamp | null = null,
  ) {
    super();
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  // Usado para criação de novas rotinas, gerando evento de criação
  static create(
    userId: UserId,
    name: RoutineName,
    divisions: RoutineDivision[],
    isActive: boolean = false
  ): Routine {
    const now = Timestamp.now();
    const routineId = RoutineId.create();

    const routine = new Routine(
      routineId,
      userId,
      name,
      divisions,
      isActive,
      now,
      now,
    );

    routine.pushEvent(
      new RoutineCreatedEvent(routineId.toString(), userId.toString(), name.toString(), now.toDate())
    );

    return routine;
  }

  // ─── GOF Criacional: PROTOTYPE ───────────────────────────────────

  // Permite clonar a rotina inteira (deep copy), gerando um novo ID, mas mantendo a estrutura de treinos.
  clone(newName?: RoutineName): Routine {
    const now = Timestamp.now();
    const clonedId = RoutineId.create();

    const clonedDivisions = this.divisions.map(division => ({
      name: division.name,
      exercises: division.exercises.map(ex => ({ ...ex }))
    }));

    const clonedRoutine = new Routine(
      clonedId,
      this.userId,
      newName ?? RoutineName.create(`${this.name.toString()} (Cópia)`),
      clonedDivisions,
      false,
      now,
      now,
    );

    clonedRoutine.pushEvent(
      new RoutineClonedEvent(this.id.toString(), clonedId.toString(), this.userId.toString(), now.toDate())
    );

    return clonedRoutine;
  }
}