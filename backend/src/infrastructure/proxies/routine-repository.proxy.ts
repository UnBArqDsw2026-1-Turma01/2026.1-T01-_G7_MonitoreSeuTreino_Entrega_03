import { Injectable, Inject } from '@nestjs/common';
import { Routine } from '../../domain/entities/routine.entity';
import type { RoutineRepository } from '../../domain/repositories/routine.repository';
import { ValidationException } from '../../domain/exceptions/domain-exceptions';
import type { ITrainingSessionRepository } from '../../domain/repositories/training-session.repository';
import { TRAINING_SESSION_REPOSITORY } from '../../domain/repositories/training-session.repository';

@Injectable()
export class RoutineRepositoryProxy implements RoutineRepository {
  constructor(
    @Inject('REAL_ROUTINE_REPOSITORY')
    private readonly realRepository: RoutineRepository,

    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
  ) {}

  async findById(id: string): Promise<Routine | null> {
    return this.realRepository.findById(id);
  }

  async findByUserId(userId: string): Promise<Routine[]> {
    return this.realRepository.findByUserId(userId);
  }

  async save(routine: Routine): Promise<void> {
    const hasHistory = await this.sessionRepository.hasCompletedSessions(
      routine.id.toString(),
    );

    if (hasHistory) {
      throw new ValidationException(
        'Proxy Protection: Esta rotina possui histórico de treinos e não pode ser editada diretamente.',
      );
    }

    await this.realRepository.save(routine);
  }

  async delete(id: string): Promise<void> {
    await this.realRepository.delete(id);
  }
}
