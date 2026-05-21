import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import { ROUTINE_REPOSITORY_TOKEN } from '../../../domain/repositories/routine.repository';
import type { RoutineRepository } from '../../../domain/repositories/routine.repository';
import { ValidationException } from '../../../domain/exceptions/domain-exceptions';
import { DomainEventBus } from '../../events/domain-event-bus';

interface ActivateRoutineInput {
  userId: string;
  routineId: string;
}

@Injectable()
export class ActivateRoutineUseCase extends UseCase<ActivateRoutineInput, void> {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN)
    private readonly routineRepository: RoutineRepository,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(input: ActivateRoutineInput): Promise<void> {
    const routine = await this.routineRepository.findById(input.routineId);

    if (!routine) {
      throw new ValidationException('Routine not found');
    }

    if (routine.userId.toString() !== input.userId) {
      throw new ValidationException('You do not have permission to activate this routine');
    }

    // A rotina se ativa e registra o evento internamente
    const activatedRoutine = routine.activate();

    await this.routineRepository.save(activatedRoutine);

    this.registerAggregate(activatedRoutine);
  }
}