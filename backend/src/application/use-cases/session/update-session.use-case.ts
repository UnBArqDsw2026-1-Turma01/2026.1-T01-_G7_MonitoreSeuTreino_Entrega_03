import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { AppLogger, APP_LOGGER } from '@application/logger/logger.interface';
import { ApplicationException, ForbiddenException } from '@application/exceptions/application-exceptions';
import { NotFoundException } from '@domain/exceptions/domain-exceptions';
import { TrainingSessionBuilder } from '@domain/builders/training-session.builder';
import { WorkoutSessionSubject } from '@domain/history/observers/workout-session-subject';
import {
  ITrainingSessionRepository,
  TRAINING_SESSION_REPOSITORY,
} from '@domain/repositories/training-session.repository';
import * as crypto from 'crypto';

export interface UpdateSessionRequestDTO {
  userId: string;
  sessionId: string;
  date?: string;
  routineId?: string;
  exercises: {
    exerciseId: string;
    expectedSets: number;
    sets: {
      targetReps: number;
      actualReps: number | null;
      weight: number | null;
      observations?: string;
    }[];
  }[];
}

export interface UpdateSessionResponseDTO {
  sessionId: string;
  totalVolume: number;
}

@Injectable()
export class UpdateSessionUseCase extends UseCase<
  UpdateSessionRequestDTO,
  UpdateSessionResponseDTO
> {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
    eventBus: DomainEventBus,
    @Inject(APP_LOGGER) private readonly logger: AppLogger,
    private readonly workoutSessionSubject: WorkoutSessionSubject,
  ) {
    super(eventBus);
  }

  protected async handle(
    request: UpdateSessionRequestDTO,
  ): Promise<UpdateSessionResponseDTO> {
    this.logger.log(
      `Iniciando atualização da sessão ${request.sessionId} para o usuário: ${request.userId}`,
    );

    try {
      const existingSession = await this.sessionRepository.findById(request.sessionId);
      if (!existingSession) {
        throw new NotFoundException('Sessão de treino não encontrada.');
      }

      if (existingSession.userId !== request.userId) {
        throw new ForbiddenException('Você não tem permissão para alterar esta sessão.');
      }

      const builder = new TrainingSessionBuilder(request.userId)
        .withCustomId(request.sessionId);

      if (request.date) builder.withDate(new Date(request.date));
      if (request.routineId) builder.withRoutine(request.routineId);

      for (const exerciseDto of request.exercises) {
        const nodeId = crypto.randomUUID();

        builder.addExercise(
          exerciseDto.exerciseId,
          exerciseDto.expectedSets,
          nodeId,
        );

        for (const setDto of exerciseDto.sets) {
          builder.addSetToExercise(
            nodeId,
            setDto.targetReps,
            setDto.actualReps,
            setDto.weight,
            setDto.observations ?? null,
          );
        }
      }

      const updatedSession = builder.build();

      await this.sessionRepository.save(updatedSession);

      this.workoutSessionSubject.notify(updatedSession);

      const totalVolume = updatedSession.getSessionTotalVolume();

      this.logger.log(
        `Sessão ${updatedSession.id} atualizada com sucesso. Volume total: ${totalVolume}`,
      );

      return {
        sessionId: updatedSession.id,
        totalVolume,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao atualizar sessão: ${message}`);
      throw new ApplicationException(
        `Falha ao atualizar sessão de treino`,
        message,
      );
    }
  }
}
