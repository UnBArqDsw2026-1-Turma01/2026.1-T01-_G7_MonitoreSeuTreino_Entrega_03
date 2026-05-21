import { Routine } from '../entities/routine.entity';

export interface RoutineRepository {
  findById(id: string): Promise<Routine | null>;
  findByUserId(userId: string): Promise<Routine[]>;
  save(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
}

export const ROUTINE_REPOSITORY_TOKEN = Symbol('RoutineRepository');
