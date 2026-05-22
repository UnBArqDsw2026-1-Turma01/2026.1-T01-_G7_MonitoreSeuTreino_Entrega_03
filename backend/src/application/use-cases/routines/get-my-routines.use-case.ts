import { Injectable, Inject } from '@nestjs/common';
import {
  ROUTINE_REPOSITORY_TOKEN,
  RoutineRepository,
} from '../../../domain/repositories/routine.repository';

@Injectable()
export class GetMyRoutinesUseCase {
  constructor(
    @Inject(ROUTINE_REPOSITORY_TOKEN)
    private readonly routineRepository: RoutineRepository,
  ) {}

  async execute(userId: string) {
    return this.routineRepository.findByUserId(userId);
  }
}
