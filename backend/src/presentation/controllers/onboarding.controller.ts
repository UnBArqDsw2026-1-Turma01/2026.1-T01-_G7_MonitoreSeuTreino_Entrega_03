import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
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
import { OnboardingFacade } from '@presentation/facades/onboarding.facade';
import { SubmitOnboardingRequest } from '../dtos/submit-onboarding.request';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import { OnboardingViewModel } from '../view-models/onboarding.view-model';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(BearerTokenGuard)
@Controller('v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingFacade: OnboardingFacade) {}

  @Get('me')
  @ApiOperation({ summary: 'Get onboarding status for the authenticated user' })
  @ApiResponse({ status: 200, description: 'Onboarding status' })
  async getStatus(@Req() req: Request) {
    const userId = req.user!.userId;
    const status = await this.onboardingFacade.getStatus(userId);
    return OnboardingViewModel.toStatusResponse(status);
  }

  @Post()
  @ApiOperation({ summary: 'Submit initial onboarding questionnaire' })
  @ApiResponse({ status: 201, description: 'Profile created' })
  @ApiResponse({ status: 409, description: 'Onboarding already completed' })
  async submit(@Req() req: Request, @Body() dto: SubmitOnboardingRequest) {
    const userId = req.user!.userId;
    const profile = await this.onboardingFacade.submit(userId, dto);
    return OnboardingViewModel.toResponse(profile);
  }

  @Put()
  @HttpCode(200)
  @ApiOperation({ summary: 'Redo onboarding questionnaire (saves history)' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 404, description: 'No existing onboarding found' })
  async redo(@Req() req: Request, @Body() dto: SubmitOnboardingRequest) {
    const userId = req.user!.userId;
    const profile = await this.onboardingFacade.redo(userId, dto);
    return OnboardingViewModel.toResponse(profile);
  }
}
