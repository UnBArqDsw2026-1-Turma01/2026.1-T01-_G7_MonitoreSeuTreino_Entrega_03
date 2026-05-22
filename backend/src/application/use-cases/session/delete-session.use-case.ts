import { Injectable, Inject } from '@nestjs/common';
import { UseCase } from '../base.use-case';
import { DomainEventBus } from '@application/events/domain-event-bus';
import { AppLogger, APP_LOGGER } from '@application/logger/logger.interface';
import { ApplicationException, ForbiddenException } from '@application/exceptions/application-exceptions';
import { NotFoundException } from '@domain/exceptions/domain-exceptions';
import { HistoryManager } from '@domain/history/history-manager';
import {
  ITrainingSessionRepository,
  TRAINING_SESSION_REPOSITORY,
} from '@domain/repositories/training-session.repository';

export interface DeleteSessionRequestDTO {
  userId: string;
  sessionId: string;
}

export interface DeleteSessionResponseDTO {
  success: boolean;
}

@Injectable()
export class DeleteSessionUseCase extends UseCase<
  DeleteSessionRequestDTO,
  DeleteSessionResponseDTO
> {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
    eventBus: DomainEventBus,
    @Inject(APP_LOGGER) private readonly logger: AppLogger,
  ) {
    super(eventBus);
  }

  protected async handle(
    request: DeleteSessionRequestDTO,
  ): Promise<DeleteSessionResponseDTO> {
    this.logger.log(
      `Iniciando exclusão da sessão ${request.sessionId} para o usuário: ${request.userId}`,
    );

    try {
      const existingSession = await this.sessionRepository.findById(request.sessionId);
      if (!existingSession) {
        throw new NotFoundException('Sessão de treino não encontrada.');
      }

      if (existingSession.userId !== request.userId) {
        throw new ForbiddenException('Você não tem permissão para excluir esta sessão.');
      }

      // Deleta da base de dados
      await this.sessionRepository.delete(request.sessionId);

      // Evita manter a sessão em cache no Multiton
      const manager = HistoryManager.getInstance(request.userId);
      manager.removeSession(request.sessionId);

      this.logger.log(`Sessão ${request.sessionId} excluída com sucesso.`);

      return {
        success: true,
      };
    } catch (error: unknown) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro ao excluir sessão: ${message}`);
      throw new ApplicationException(
        `Falha ao excluir sessão de treino`,
        message,
      );
    }
  }
}
