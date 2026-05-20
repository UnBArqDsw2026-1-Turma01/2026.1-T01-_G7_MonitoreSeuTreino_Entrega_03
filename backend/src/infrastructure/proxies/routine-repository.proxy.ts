import { Injectable, Inject } from '@nestjs/common';
import { Routine } from '../../domain/entities/routine.entity';
import type { RoutineRepository } from '../../domain/repositories/routine.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import { SESSION_REPOSITORY_TOKEN } from '../../domain/repositories/session.repository';
import { ValidationException } from '../../domain/exceptions/domain-exceptions';

@Injectable()
export class RoutineRepositoryProxy implements RoutineRepository {
  constructor(
    @Inject('REAL_ROUTINE_REPOSITORY')
    private readonly realRepository: RoutineRepository,

    @Inject(SESSION_REPOSITORY_TOKEN)
    private readonly sessionRepository: SessionRepository,
  ) {}

  async findById(id: string): Promise<Routine | null> {
    return this.realRepository.findById(id);
  }

  async save(routine: Routine): Promise<void> {
    const hasHistory = await this.sessionRepository.hasCompletedSessions(routine.id.toString());

    if (hasHistory) {
      throw new ValidationException(
        'Proxy Protection: Esta rotina possui histórico de treinos e não pode ser editada diretamente.'
      );
    }

    await this.realRepository.save(routine);
  }
}