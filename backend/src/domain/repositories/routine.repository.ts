import { Routine } from '../entities/routine.entity';

export interface RoutineRepository {
  findById(id: string): Promise<Routine | null>;
  save(routine: Routine): Promise<void>;
}

export const ROUTINE_REPOSITORY_TOKEN = Symbol('RoutineRepository');