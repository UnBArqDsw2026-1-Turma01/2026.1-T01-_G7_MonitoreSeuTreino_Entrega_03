import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import {
  RoutineRepository,
  ROUTINE_REPOSITORY_TOKEN,
} from '../../../domain/repositories/routine.repository';
import {
  Routine,
  RoutineDivision,
} from '../../../domain/entities/routine.entity';
import { RoutineName } from '../../../domain/value-objects/routine-name.vo';
import { UserId } from '../../../domain/value-objects/user-id.vo';
import { DomainEventBus } from '../../events/domain-event-bus';

export interface CreateRoutineInput {
  userId: string;
  name: string;
  divisions: RoutineDivision[];
}

@Injectable()
export class CreateRoutineUseCase extends UseCase<CreateRoutineInput, void> {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN)
    private readonly routineRepository: RoutineRepository,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(input: CreateRoutineInput): Promise<void> {
    const routine = Routine.create(
      UserId.reconstitute(input.userId),
      RoutineName.create(input.name),
      input.divisions,
      false,
    );

    await this.routineRepository.save(routine);
    this.registerAggregate(routine);
  }
}
