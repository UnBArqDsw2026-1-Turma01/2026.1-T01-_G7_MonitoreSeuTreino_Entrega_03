import { Module, OnModuleInit } from '@nestjs/common';
import { RoutineController } from './presentation/controllers/routine.controller';
import { CloneRoutineUseCase } from './application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from './application/use-cases/routines/update-routine.use-case';
import { ActivateRoutineUseCase } from './application/use-cases/routines/activate-routine.use-case';
import { ROUTINE_REPOSITORY_TOKEN } from './domain/repositories/routine.repository';
import { SESSION_REPOSITORY_TOKEN } from './domain/repositories/session.repository';
import { InMemoryRoutineRepository } from './infrastructure/repositories/in-memory-routine.repository';
import { InMemorySessionRepository } from './infrastructure/repositories/in-memory-session.repository';
import { RoutineRepositoryProxy } from './infrastructure/proxies/routine-repository.proxy';
import { DomainEventBus } from './application/events/domain-event-bus';
import { DeactivateOtherRoutinesHandler } from './application/events/handlers/deactivate-other-routines.handler';

@Module({
  controllers: [RoutineController],
  providers: [
    CloneRoutineUseCase,
    UpdateRoutineUseCase,
    ActivateRoutineUseCase,
    DeactivateOtherRoutinesHandler,
    DomainEventBus,

    { provide: 'REAL_ROUTINE_REPOSITORY', useClass: InMemoryRoutineRepository },
    { provide: SESSION_REPOSITORY_TOKEN, useClass: InMemorySessionRepository },
    { provide: ROUTINE_REPOSITORY_TOKEN, useClass: RoutineRepositoryProxy },
  ],
})
export class RoutineModule implements OnModuleInit {
  constructor(
    private readonly eventBus: DomainEventBus,
    private readonly deactivateHandler: DeactivateOtherRoutinesHandler,
  ) {}

  onModuleInit() {
    this.eventBus.subscribe('RoutineActivatedEvent', (event) =>
      this.deactivateHandler.handle(event as any)
    );
  }
}