import { Inject, Injectable } from '@nestjs/common';
import {
  HISTORY_SERVICE,
  IHistoryService,
  SessionHistorySummary,
} from '@domain/history/services/i-history.service';

export interface ListSessionHistoryInput {
  userId: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class ListSessionHistoryUseCase {
  constructor(
    @Inject(HISTORY_SERVICE)
    private readonly historyService: IHistoryService,
  ) {}

  async execute(
    input: ListSessionHistoryInput,
  ): Promise<SessionHistorySummary[]> {
    return this.historyService.listCompletedSessions(input.userId, {
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });
  }
}
