import {
  TOKEN_SERVICE,
  type TokenService,
} from '@domain/services/token.service';
import {
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthenticateUserRequest } from '../dtos/authenticate-user.request';
import { RegisterUserRequest } from '../dtos/register-user.request';
import { AuthenticationFacade } from '../facades/authentication.facade';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import { AuthViewModel } from '../view-models/auth.view-model';
import { UserViewModel } from '../view-models/user.view-model';

@ApiTags('auth')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authFacade: AuthenticationFacade,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: TokenService,
  ) {}

  @Post('signup')
  @Throttle({ auth: { ttl: 60_000, limit: 3 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async register(@Body() dto: RegisterUserRequest) {
    const user = await this.authFacade.register(
      dto.name,
      dto.email,
      dto.password,
    );
    return UserViewModel.toResponse(user);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ auth: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: 'Authenticate user and issue tokens' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async authenticate(
    @Body() dto: AuthenticateUserRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authFacade.authenticate(dto.email, dto.password);
    const ttlMs = this.tokenService.getRefreshTokenTtl().toMs();

    res.cookie('refresh_token', result.refreshToken.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: ttlMs,
      path: '/v1/auth/refresh',
    });

    return AuthViewModel.toResponse(result.accessToken, result.user);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Rotate refresh token and issue new access token' })
  @ApiResponse({ status: 200, description: 'Tokens rotated successfully' })
  @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
  async rotateToken(@Req() req: Request) {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) throw new UnauthorizedException('Refresh token not provided');

    const result = await this.authFacade.rotateToken(token);
    return {
      accessToken: result.accessToken.toString(),
      refreshToken: result.refreshToken.toString(),
    };
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke current session' })
  @ApiResponse({ status: 204, description: 'Session revoked successfully' })
  async revokeSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.userId;

    const refreshToken = req.cookies?.refresh_token as string | undefined;

    if (typeof userId === 'string') {
      if (refreshToken) {
        await this.authFacade.invalidateSession(userId, refreshToken);
      } else {
        await this.authFacade.invalidateAllSessions(userId);
      }
    }

    res.clearCookie('refresh_token', { path: '/v1/auth/refresh' });
  }

  @Post('logout-all')
  @HttpCode(204)
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all sessions (all devices)' })
  @ApiResponse({
    status: 204,
    description: 'All sessions revoked successfully',
  })
  async revokeAllSessions(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = req.user?.userId;

    if (typeof userId === 'string') {
      await this.authFacade.invalidateAllSessions(userId);
    }

    res.clearCookie('refresh_token', { path: '/v1/auth/refresh' });
  }
}
