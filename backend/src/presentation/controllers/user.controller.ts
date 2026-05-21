import {
  Body,
  Controller,
  Delete,
  HttpCode,
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
import { DeleteAccountRequest } from '../dtos/delete-account.request';
import { AccountDeletionFacade } from '../facades/account-deletion.facade';
import { BearerTokenGuard } from '../guards/bearer-token.guard';

@ApiTags('users')
@Controller('v1/users')
export class UserController {
  constructor(private readonly accountDeletionFacade: AccountDeletionFacade) {}

  @Delete('me')
  @HttpCode(204)
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Permanently delete the authenticated user account',
  })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Incorrect password or wrong confirmation phrase',
  })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async deleteAccount(
    @Req() req: Request,
    @Body() dto: DeleteAccountRequest,
  ): Promise<void> {
    const userId = req.user!.userId;
    await this.accountDeletionFacade.delete(
      userId,
      dto.password,
      dto.confirmation,
    );
  }
}
