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
export class UpdateRoutineUseCase extends UseCase<any, void> {
  constructor(@Inject(ROUTINE_REPOSITORY_TOKEN) private repo: RoutineRepository, eventBus: DomainEventBus) { super(eventBus); }

  protected async handle(input: any): Promise<void> {
    const routine = await this.repo.findById(input.routineId);
    if (!routine) throw new ValidationException('Routine not found');

    routine.update(RoutineName.create(input.newName), input.divisions);
    await this.repo.save(routine);
  }
}