import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { RoutineActivatedEvent } from '../../../domain/events/routine-events';
import { Inject, Injectable } from '@nestjs/common';
import { ROUTINE_REPOSITORY_TOKEN, RoutineRepository } from '../../../domain/repositories/routine.repository';

@EventsHandler(RoutineActivatedEvent)
@Injectable()
export class DeactivateOtherRoutinesHandler implements IEventHandler<RoutineActivatedEvent> {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN) private readonly repo: RoutineRepository
  ) {}

  async handle(event: RoutineActivatedEvent) {
    const { userId, routineId } = event;

    const activeRoutines = await this.repo.findByUserId(userId);
    const others = activeRoutines.filter(r => r.id.toString() !== routineId);

    // Inativando outras rotinas
    for (const routine of others) {
      (routine as any).isActive = false;
      await this.repo.save(routine);
    }
  }
}