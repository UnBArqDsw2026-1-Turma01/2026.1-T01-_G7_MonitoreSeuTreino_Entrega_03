import { Injectable } from '@nestjs/common';
import { Routine } from '../../domain/entities/routine.entity';
import { RoutineRepository } from '../../domain/repositories/routine.repository';

@Injectable()
export class InMemoryRoutineRepository implements RoutineRepository {
  private routines = new Map<string, Routine>();

  async findById(id: string): Promise<Routine | null> {
    return this.routines.get(id) || null;
  }

  async save(routine: Routine): Promise<void> {
    this.routines.set(routine.id.toString(), routine);

    // Log para provar que o Proxy deixou a requisição passar
    console.log('💾 [Banco Real] Rotina salva fisicamente no banco de dados!');
  }
}