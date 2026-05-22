import { Inject, Injectable } from '@nestjs/common';
import { AppLogger, APP_LOGGER } from '@application/logger/logger.interface';
import { HistoryService } from '@application/services/history.service';
import { ForbiddenException } from '@application/exceptions/application-exceptions';
import { ValidationException } from '@domain/exceptions/domain-exceptions';
import {
  DateRangeFilter,
  IHistoryService,
  SessionHistoryDetail,
  SessionHistorySummary,
} from '@domain/history/services/i-history.service';

/**
 * GOF ESTRUTURAL — PROXY
 *
 * Mesma interface do serviço real (IHistoryService), mas intercepta chamadas
 * para validar acesso, registrar logs e delegar ao HistoryService.
 *
 * Diferença Proxy vs serviço real:
 * - HistoryService: regra de negócio + repositório + Multiton.
 * - HistoryServiceProxy: controle transversal (authz, auditoria) sem alterar o real.
 *
 * Por que é estrutural: o Proxy compõe/substitui a interface do serviço real
 * de forma transparente para quem consome (use cases injetam HISTORY_SERVICE).
 */
@Injectable()
export class HistoryServiceProxy implements IHistoryService {
  constructor(
    private readonly realService: HistoryService,
    @Inject(APP_LOGGER) private readonly logger: AppLogger,
  ) {}

  async listCompletedSessions(
    authenticatedUserId: string,
    filter?: DateRangeFilter,
  ): Promise<SessionHistorySummary[]> {
    this.assertAuthenticated(authenticatedUserId);
    this.validateDateRange(filter);

    this.logger.log(
      `[HistoryProxy] Listagem de histórico — userId=${authenticatedUserId}` +
        (filter?.startDate || filter?.endDate
          ? ` período=${filter?.startDate?.toISOString() ?? '*'}..${filter?.endDate?.toISOString() ?? '*'}`
          : ''),
    );

    return this.realService.listCompletedSessions(authenticatedUserId, filter);
  }

  async getSessionDetail(
    authenticatedUserId: string,
    sessionId: string,
  ): Promise<SessionHistoryDetail> {
    this.assertAuthenticated(authenticatedUserId);

    this.logger.log(
      `[HistoryProxy] Detalhe de sessão — userId=${authenticatedUserId} sessionId=${sessionId}`,
    );

    return this.realService.getSessionDetail(authenticatedUserId, sessionId);
  }

  private assertAuthenticated(userId: string): void {
    if (!userId?.trim()) {
      throw new ForbiddenException(
        'Acesso ao histórico requer usuário autenticado.',
      );
    }
  }

  private validateDateRange(filter?: DateRangeFilter): void {
    if (
      filter?.startDate &&
      filter?.endDate &&
      filter.startDate > filter.endDate
    ) {
      throw new ValidationException(
        'Intervalo de datas inválido: data inicial posterior à data final.',
      );
    }
  }
}
