import { Controller, Post, Put, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CloneRoutineUseCase } from '../../application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from '../../application/use-cases/routines/update-routine.use-case';

@Controller('routines')
export class RoutineController {
  constructor(
    private readonly cloneRoutineUseCase: CloneRoutineUseCase,
    private readonly updateRoutineUseCase: UpdateRoutineUseCase,
  ) {}

  // Rota do PROTOTYPE (RF17)
  @Post(':id/clone')
  @HttpCode(HttpStatus.OK)
  async clone(
    @Param('id') routineId: string,
    @Body('userId') userId: string,
    @Body('newName') newName?: string,
  ) {
    await this.cloneRoutineUseCase.execute({
      routineId,
      userId,
      newName,
    });

    return { message: 'Routine cloned successfully' };
  }

  // Rota do PROXY (RF19)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') routineId: string,
    @Body('userId') userId: string,
    @Body('newName') newName: string,
  ) {
    // O Use Case tenta salvar, mas o Proxy intercepta e faz a validação de histórico
    await this.updateRoutineUseCase.execute({
      routineId,
      userId,
      newName,
    });

    return { message: 'Routine updated successfully' };
  }
}