import {
  Body,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfirmPasswordResetRequest } from '../dtos/confirm-password-reset.request';
import { RequestPasswordResetRequest } from '../dtos/request-password-reset.request';
import { PasswordResetFacade } from '../facades/password-reset.facade';

@ApiTags('auth')
@Controller('v1/auth/password-reset')
export class PasswordResetController {
  constructor(private readonly passwordResetFacade: PasswordResetFacade) {}

  @Post('request')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a password reset link by email' })
  @ApiResponse({
    status: 200,
    description: 'If the email is registered, a reset link will be sent',
  })
  async requestReset(@Body() dto: RequestPasswordResetRequest): Promise<void> {
    await this.passwordResetFacade.requestReset(dto.email);
  }

  @Post('confirm')
  @HttpCode(200)
  @ApiOperation({ summary: 'Confirm password reset with token and new password' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 401, description: 'Invalid, expired or already used token' })
  async confirmReset(
    @Body() dto: ConfirmPasswordResetRequest,
  ): Promise<void> {
    await this.passwordResetFacade.confirmReset(dto.token, dto.newPassword);
  }
}
