import { Inject, Injectable } from '@nestjs/common';
import { ExerciseNode } from '@domain/entities/exercise-node';
import { TrainingSet } from '@domain/entities/training-set';
import { HistoryManager } from '@domain/history/history-manager';
import {
  DateRangeFilter,
  IHistoryService,
  SessionHistoryDetail,
  SessionHistoryExerciseDetail,
  SessionHistorySetDetail,
  SessionHistorySummary,
} from '@domain/history/services/i-history.service';
import {
  ITrainingSessionRepository,
  TRAINING_SESSION_REPOSITORY,
} from '@domain/repositories/training-session.repository';
import { NotFoundException } from '@domain/exceptions/domain-exceptions';
import { TrainingSession } from '@domain/entities/training-session';

/**
 * Serviço REAL de histórico — acessa repositório e Multiton (HistoryManager).
 * Não deve ser injetado diretamente nos use cases: use HISTORY_SERVICE (Proxy).
 */
@Injectable()
export class HistoryService implements IHistoryService {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
  ) {}

  async listCompletedSessions(
    authenticatedUserId: string,
    filter?: DateRangeFilter,
  ): Promise<SessionHistorySummary[]> {
    const manager = HistoryManager.getInstance(authenticatedUserId);

    const hasDateFilter = Boolean(filter?.startDate ?? filter?.endDate);

    let sessions: TrainingSession[];

    if (hasDateFilter) {
      sessions = await this.sessionRepository.findCompletedByUserId(
        authenticatedUserId,
        {
          startDate: filter?.startDate,
          endDate: filter?.endDate,
        },
      );
      manager.loadSessions(sessions);
    } else if (manager.getSessions().length > 0) {
      sessions = manager.getSessions();
    } else {
      sessions = await this.sessionRepository.findCompletedByUserId(
        authenticatedUserId,
      );
      manager.loadSessions(sessions);
    }

    return sessions.map((session) => this.toSummary(session));
  }

  async getSessionDetail(
    authenticatedUserId: string,
    sessionId: string,
  ): Promise<SessionHistoryDetail> {
    const manager = HistoryManager.getInstance(authenticatedUserId);

    let session =
      manager.getSessionById(sessionId) ??
      (await this.sessionRepository.findById(sessionId));

    if (!session || session.userId !== authenticatedUserId) {
      throw new NotFoundException('Sessão de treino não encontrada.');
    }

    if (!session.isCompleted()) {
      throw new NotFoundException('Sessão de treino não encontrada.');
    }

    manager.addSession(session);

    return this.toDetail(session);
  }

  private toSummary(session: TrainingSession): SessionHistorySummary {
    return {
      sessionId: session.id,
      date: session.date,
      routineId: session.routineId,
      exerciseCount: session.getComponents().length,
    };
  }

  private toDetail(session: TrainingSession): SessionHistoryDetail {
    const exercises: SessionHistoryExerciseDetail[] = session
      .getComponents()
      .map((component) => {
        if (!(component instanceof ExerciseNode)) {
          throw new Error('Componente inválido na sessão.');
        }

        const sets: SessionHistorySetDetail[] = component
          .getChildren()
          .map((child) => {
            if (!(child instanceof TrainingSet)) {
              throw new Error('Série inválida na sessão.');
            }

            return {
              id: child.id,
              targetReps: child.targetReps,
              actualReps: child.actualReps,
              weight: child.weight,
              observations: child.observations,
            };
          });

        return {
          id: component.id,
          exerciseId: component.exerciseId,
          expectedSets: component.expectedSets,
          sets,
        };
      });

    return {
      ...this.toSummary(session),
      totalVolume: session.getSessionTotalVolume(),
      exercises,
    };
  }
}
