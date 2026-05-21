import { AggregateRoot } from './aggregate-root';
import { RoutineId } from '../value-objects/routine-id.vo';
import { RoutineName } from '../value-objects/routine-name.vo';
import { UserId } from '../value-objects/user-id.vo';
import { Timestamp } from '../value-objects/timestamp.vo';
import { RoutineCreatedEvent, RoutineClonedEvent, RoutineActivatedEvent } from '../events/routine-events';

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

  static reconstitute(data: {
    id: string;
    userId: string;
    name: string;
    divisions: any[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
  }): Routine {
    return new Routine(
      RoutineId.reconstitute(data.id),
      UserId.reconstitute(data.userId),
      RoutineName.create(data.name),
      data.divisions as RoutineDivision[],
      data.isActive,
      Timestamp.reconstitute(data.createdAt),
      Timestamp.reconstitute(data.updatedAt),
      data.deletedAt ? Timestamp.reconstitute(data.deletedAt) : null,
    );
  }

  update(newName: RoutineName, newDivisions: RoutineDivision[]): void {
    (this as any).name = newName;
    (this as any).divisions = newDivisions;
    (this as any).updatedAt = Timestamp.now();
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

  // ─── GOF Comportamental: MEDIATOR (RF21) ─────────────────────────

  // Ativa a rotina atual e emite o evento para o EventBus
  activate(): Routine {
    const now = Timestamp.now();

    const activatedRoutine = new Routine(
      this.id,
      this.userId,
      this.name,
      this.divisions,
      true,
      this.createdAt,
      now,
      this.deletedAt,
    );

    activatedRoutine.pushEvent(
      new RoutineActivatedEvent(this.id.toString(), this.userId.toString(), now.toDate())
    );

    return activatedRoutine;
  }
}