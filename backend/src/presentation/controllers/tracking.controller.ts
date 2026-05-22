import {
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { TrackingFacade } from '@presentation/facades/tracking.facade';
import { WeeklySummaryRequest } from '@presentation/dtos/weekly-summary.request';
import { BearerTokenGuard } from '@presentation/guards/bearer-token.guard';
import { TrackingViewModel } from '@presentation/view-models/tracking.view-model';

@ApiTags('tracking')
@ApiBearerAuth()
@UseGuards(BearerTokenGuard)
@Controller('v1/tracking')
export class TrackingController {
  constructor(
    private readonly trackingFacade: TrackingFacade,
  ) {}

  @Get('weekly-summary')
  @ApiOperation({
    summary:
      'Get weekly monitoring summary',
  })
  @ApiResponse({
    status: 200,
    description:
      'Weekly summary returned successfully',
  })
  async weeklySummary(
    @Req() req: Request,

    @Query()
    query: WeeklySummaryRequest,
  ) {
    const userId = req.user!.userId;

    const summary =
      await this.trackingFacade.weeklySummary(
        userId,
        query.weekOffset ?? 0,
      );

    return TrackingViewModel.toResponse(
      summary,
    );
  }
}