import { Inject, Injectable } from '@nestjs/common';
import {
  HISTORY_SERVICE,
  IHistoryService,
  SessionHistoryDetail,
} from '@domain/history/services/i-history.service';

export interface GetSessionHistoryDetailInput {
  userId: string;
  sessionId: string;
}

@Injectable()
export class GetSessionHistoryDetailUseCase {
  constructor(
    @Inject(HISTORY_SERVICE)
    private readonly historyService: IHistoryService,
  ) {}

  async execute(
    input: GetSessionHistoryDetailInput,
  ): Promise<SessionHistoryDetail> {
    return this.historyService.getSessionDetail(input.userId, input.sessionId);
  }
}
