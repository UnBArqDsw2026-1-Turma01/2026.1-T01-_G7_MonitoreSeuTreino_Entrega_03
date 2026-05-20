import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import type {RoutineRepository} from '../../../domain/repositories/routine.repository';
import { ROUTINE_REPOSITORY_TOKEN } from '../../../domain/repositories/routine.repository';
import { RoutineName } from '../../../domain/value-objects/routine-name.vo';
import { ValidationException } from '../../../domain/exceptions/domain-exceptions';
import { DomainEventBus } from '../../events/domain-event-bus';

interface UpdateRoutineInput {
  userId: string;
  routineId: string;
  newName: string;
}

@Injectable()
export class UpdateRoutineUseCase extends UseCase<UpdateRoutineInput, void> {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN) // O Decorator garante que o Proxy seja injetado
    private readonly routineRepository: RoutineRepository,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(input: UpdateRoutineInput): Promise<void> {
    const routine = await this.routineRepository.findById(input.routineId);

    if (!routine) {
      throw new ValidationException('Routine not found');
    }

    if (routine.userId.toString() !== input.userId) {
      throw new ValidationException('You do not have permission to edit this routine');
    }

    const updatedRoutine = routine.clone(RoutineName.create(input.newName));

    await this.routineRepository.save(updatedRoutine);

    this.registerAggregate(updatedRoutine);
  }
}