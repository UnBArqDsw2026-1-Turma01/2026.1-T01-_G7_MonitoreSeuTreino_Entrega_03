import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterSessionUseCase } from '@application/use-cases/session/register-session.use-case';
import { RegisterSessionRequest } from '../dtos/register-session.request';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import type { Request } from 'express';

@ApiTags('sessions')
@Controller('v1/sessions')
export class SessionController {
  constructor(
    private readonly registerSessionUseCase: RegisterSessionUseCase,
  ) {}

  @Post()
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Registra a execução de uma nova Sessão de Treino' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sessão registrada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos no payload.',
  })
  @HttpCode(HttpStatus.CREATED)
  async registerSession(
    @Req() req: Request,
    @Body() payload: RegisterSessionRequest,
  ) {
    const userId = req.user!.userId;

    const response = await this.registerSessionUseCase.execute({
      userId,
      date: payload.date,
      routineId: payload.routineId,
      exercises: payload.exercises.map((ex) => ({
        exerciseId: ex.exerciseId,
        expectedSets: ex.expectedSets,
        sets: ex.sets.map((set) => ({
          targetReps: set.targetReps,
          actualReps: set.actualReps ?? null,
          weight: set.weight ?? null,
          observations: set.observations,
        })),
      })),
    });

    return response;
  }
}
