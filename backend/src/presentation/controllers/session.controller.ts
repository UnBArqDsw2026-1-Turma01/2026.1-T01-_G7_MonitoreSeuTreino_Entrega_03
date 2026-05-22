import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Req,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RegisterSessionUseCase } from '@application/use-cases/session/register-session.use-case';
import { UpdateSessionUseCase } from '@application/use-cases/session/update-session.use-case';
import { DeleteSessionUseCase } from '@application/use-cases/session/delete-session.use-case';
import { RegisterSessionRequest } from '../dtos/register-session.request';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import type { Request } from 'express';

@ApiTags('sessions')
@Controller('v1/sessions')
export class SessionController {
  constructor(
    private readonly registerSessionUseCase: RegisterSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
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

  @Put(':sessionId')
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma Sessão de Treino existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessão atualizada com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sessão não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para alterar esta sessão.',
  })
  async updateSession(
    @Req() req: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() payload: RegisterSessionRequest,
  ) {
    const userId = req.user!.userId;

    const response = await this.updateSessionUseCase.execute({
      userId,
      sessionId,
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

  @Delete(':sessionId')
  @UseGuards(BearerTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exclui uma Sessão de Treino existente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessão excluída com sucesso.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sessão não encontrada.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para excluir esta sessão.',
  })
  async deleteSession(
    @Req() req: Request,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
  ) {
    const userId = req.user!.userId;

    const response = await this.deleteSessionUseCase.execute({
      userId,
      sessionId,
    });

    return response;
  }
}
