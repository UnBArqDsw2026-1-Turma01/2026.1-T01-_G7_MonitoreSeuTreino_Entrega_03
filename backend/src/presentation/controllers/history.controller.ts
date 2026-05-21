import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { ListSessionHistoryUseCase } from '@application/use-cases/history/list-session-history.use-case';
import { GetSessionHistoryDetailUseCase } from '@application/use-cases/history/get-session-history-detail.use-case';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import { FilterSessionHistoryQuery } from '../dtos/filter-session-history.query';
import { SessionHistoryViewModel } from '../view-models/session-history.view-model';

@ApiTags('history')
@ApiBearerAuth()
@UseGuards(BearerTokenGuard)
@Controller('v1/history/sessions')
export class HistoryController {
  constructor(
    private readonly listSessionHistory: ListSessionHistoryUseCase,
    private readonly getSessionHistoryDetail: GetSessionHistoryDetailUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'RF26/RF27 — Listar histórico de sessões concluídas (opcional: filtro por período)',
  })
  @ApiResponse({ status: 200, description: 'Lista ordenada por data decrescente' })
  async list(
    @Req() req: Request,
    @Query() query: FilterSessionHistoryQuery,
  ) {
    const userId = req.user!.userId;

    const summaries = await this.listSessionHistory.execute({
      userId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return SessionHistoryViewModel.toListResponse(summaries);
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'RF26 — Detalhes completos de uma sessão do histórico' })
  @ApiResponse({ status: 200, description: 'Detalhes da sessão' })
  @ApiResponse({ status: 404, description: 'Sessão não encontrada' })
  async getDetail(
    @Req() req: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    const userId = req.user!.userId;

    const detail = await this.getSessionHistoryDetail.execute({
      userId,
      sessionId,
    });

    return SessionHistoryViewModel.toDetailResponse(detail);
  }
}
