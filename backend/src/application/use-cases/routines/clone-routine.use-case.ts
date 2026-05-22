import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import {
  RoutineRepository,
  ROUTINE_REPOSITORY_TOKEN,
} from '../../../domain/repositories/routine.repository';
import { RoutineName } from '../../../domain/value-objects/routine-name.vo';
import { ValidationException } from '../../../domain/exceptions/domain-exceptions';
import { DomainEventBus } from '../../events/domain-event-bus';

export interface CloneRoutineInput {
  userId: string;
  routineId: string;
  newName?: string;
}

@Injectable()
export class CloneRoutineUseCase extends UseCase<CloneRoutineInput, void> {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN)
    private readonly routineRepository: RoutineRepository,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(input: CloneRoutineInput): Promise<void> {
    const originalRoutine = await this.routineRepository.findById(
      input.routineId,
    );

    if (!originalRoutine) {
      throw new ValidationException('Routine not found');
    }

    if (originalRoutine.userId.toString() !== input.userId) {
      throw new ValidationException(
        'You do not have permission to clone this routine',
      );
    }

    const newRoutineName = input.newName
      ? RoutineName.create(input.newName)
      : undefined;
    const clonedRoutine = originalRoutine.clone(newRoutineName);
    await this.routineRepository.save(clonedRoutine);

    this.registerAggregate(clonedRoutine);
  }
}
