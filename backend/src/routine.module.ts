import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineController } from './presentation/controllers/routine.controller';
import { CreateRoutineUseCase } from './application/use-cases/routines/create-routine.use-case';
import { CloneRoutineUseCase } from './application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from './application/use-cases/routines/update-routine.use-case';
import { ActivateRoutineUseCase } from './application/use-cases/routines/activate-routine.use-case';
import { GetMyRoutinesUseCase } from './application/use-cases/routines/get-my-routines.use-case'; // Importado
import { ROUTINE_REPOSITORY_TOKEN } from './domain/repositories/routine.repository';
import { SESSION_REPOSITORY_TOKEN } from './domain/repositories/session.repository';
import { RoutineRepositoryProxy } from './infrastructure/proxies/routine-repository.proxy';
import { DomainEventBus } from './application/events/domain-event-bus';
import { DeactivateOtherRoutinesHandler } from './application/events/handlers/deactivate-other-routines.handler';
import { DeleteRoutineUseCase } from './application/use-cases/routines/delete-routine.use-case';
import { InactivateRoutineUseCase } from './application/use-cases/routines/inactivate-routine.use-case';

import { RoutinePostgresRepository } from './infrastructure/database/routine.postgres-repository';
import { SessionPostgresRepository } from './infrastructure/database/session.postgres-repository';
import { RoutineOrmEntity } from './infrastructure/database/routine.orm-entity';
import { SessionOrmEntity } from './infrastructure/database/session.orm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoutineOrmEntity, SessionOrmEntity])
  ],
  controllers: [RoutineController],
  providers: [
    CreateRoutineUseCase,
    CloneRoutineUseCase,
    UpdateRoutineUseCase,
    ActivateRoutineUseCase,
    GetMyRoutinesUseCase,
    DeactivateOtherRoutinesHandler,
    DomainEventBus,
    DeleteRoutineUseCase,
    InactivateRoutineUseCase,

    { provide: 'REAL_ROUTINE_REPOSITORY', useClass: RoutinePostgresRepository },
    { provide: SESSION_REPOSITORY_TOKEN, useClass: SessionPostgresRepository },
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