import { Injectable, Inject } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY_TOKEN,
  RoutineRepository,
} from '../../../domain/repositories/routine.repository';

@Injectable()
export class DeleteRoutineUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN) private readonly repo: RoutineRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
