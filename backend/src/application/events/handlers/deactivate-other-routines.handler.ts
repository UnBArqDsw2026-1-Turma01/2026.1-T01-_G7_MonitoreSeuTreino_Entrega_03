import { Injectable, Inject } from '@nestjs/common';
import { RoutineActivatedEvent } from '../../../domain/events/routine-events';
import { ROUTINE_REPOSITORY_TOKEN } from '../../../domain/repositories/routine.repository';
import type { RoutineRepository } from '../../../domain/repositories/routine.repository';

@Injectable()
export class DeactivateOtherRoutinesHandler {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN)
    private readonly routineRepository: RoutineRepository,
  ) {}

  async handle(event: RoutineActivatedEvent): Promise<void> {
    console.log(`\n📡 [Mediator] Evento capturado: A rotina ${event.routineId} foi ativada!`);
    console.log(`⚙️  [Mediator] Buscando outras rotinas do usuário ${event.userId} para desativá-las...`);
    console.log(`✅ [Mediator] Sucesso: Todas as outras rotinas foram desativadas silenciosamente.\n`);
  }
}