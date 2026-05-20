import { Module } from '@nestjs/common';
import { RoutineController } from './presentation/controllers/routine.controller';
import { CloneRoutineUseCase } from './application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from './application/use-cases/routines/update-routine.use-case';
import { ROUTINE_REPOSITORY_TOKEN } from './domain/repositories/routine.repository';
import { SESSION_REPOSITORY_TOKEN } from './domain/repositories/session.repository';
import { InMemoryRoutineRepository } from './infrastructure/repositories/in-memory-routine.repository';
import { InMemorySessionRepository } from './infrastructure/repositories/in-memory-session.repository';
import { RoutineRepositoryProxy } from './infrastructure/proxies/routine-repository.proxy';
import { DomainEventBus } from './application/events/domain-event-bus';

@Module({
  controllers: [RoutineController],
  providers: [
    CloneRoutineUseCase,
    UpdateRoutineUseCase,
    DomainEventBus,

    {
      provide: 'REAL_ROUTINE_REPOSITORY',
      useClass: InMemoryRoutineRepository,
    },
    {
      provide: SESSION_REPOSITORY_TOKEN,
      useClass: InMemorySessionRepository,
    },
    {
      provide: ROUTINE_REPOSITORY_TOKEN,
      useClass: RoutineRepositoryProxy,
    },
  ],
})
export class RoutineModule {}