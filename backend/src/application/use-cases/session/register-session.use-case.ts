import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { AppLogger, APP_LOGGER } from '@application/logger/logger.interface';
import { ApplicationException } from '@application/exceptions/application-exceptions';
import { TrainingSessionBuilder } from '@domain/builders/training-session.builder';
import { ITrainingSessionRepository, TRAINING_SESSION_REPOSITORY } from '@domain/repositories/training-session.repository';
import * as crypto from 'crypto';

export interface RegisterSessionRequestDTO {
  userId: string;
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

export interface RegisterSessionResponseDTO {
  sessionId: string;
  totalVolume: number;
}

@Injectable()
export class RegisterSessionUseCase extends UseCase<RegisterSessionRequestDTO, RegisterSessionResponseDTO> {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
    eventBus: DomainEventBus,
    @Inject(APP_LOGGER) private readonly logger: AppLogger,
  ) {
    super(eventBus);
  }

  protected async handle(request: RegisterSessionRequestDTO): Promise<RegisterSessionResponseDTO> {
    this.logger.log(`Iniciando registro de sessão para o usuário: ${request.userId}`);

    try {
      const builder = new TrainingSessionBuilder(request.userId);

      if (request.date) builder.withDate(new Date(request.date));
      if (request.routineId) builder.withRoutine(request.routineId);

      for (const exerciseDto of request.exercises) {
        const nodeId = crypto.randomUUID(); 
        
        builder.addExercise(exerciseDto.exerciseId, exerciseDto.expectedSets, nodeId);

        for (const setDto of exerciseDto.sets) {
          builder.addSetToExercise(
            nodeId,
            setDto.targetReps,
            setDto.actualReps,
            setDto.weight,
            setDto.observations,
          );
        }
      }

      const session = builder.build();

      await this.sessionRepository.save(session);

      const totalVolume = session.getSessionTotalVolume();

      this.logger.log(`Sessão ${session.id} salva com sucesso. Volume total: ${totalVolume}`);

      return {
        sessionId: session.id,
        totalVolume,
      };

    } catch (error: any) {
      this.logger.error(`Erro ao registrar sessão: ${error.message}`);
      throw new ApplicationException(`Falha ao registrar sessão de treino`, error.message);
    }
  }
}