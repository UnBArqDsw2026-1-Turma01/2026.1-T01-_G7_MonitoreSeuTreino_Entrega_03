import { Injectable, Inject } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY_TOKEN,
  RoutineRepository,
} from '../../../domain/repositories/routine.repository';
import { ValidationException } from '../../../domain/exceptions/domain-exceptions';

@Injectable()
export class InactivateRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN) private repo: RoutineRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const routine = await this.repo.findById(id);
    if (!routine) throw new ValidationException('Routine not found');

    routine.inactivate();

    await this.repo.save(routine);
  }
}