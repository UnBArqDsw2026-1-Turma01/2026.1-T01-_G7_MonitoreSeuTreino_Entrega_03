import { Controller, Post, Put, Patch, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CloneRoutineUseCase } from '../../application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from '../../application/use-cases/routines/update-routine.use-case';
import { ActivateRoutineUseCase } from '../../application/use-cases/routines/activate-routine.use-case';

@Controller('routines')
export class RoutineController {
  constructor(
    private readonly cloneRoutineUseCase: CloneRoutineUseCase,
    private readonly updateRoutineUseCase: UpdateRoutineUseCase,
    private readonly activateRoutineUseCase: ActivateRoutineUseCase,
  ) {}

  // Rota do PROTOTYPE
  @Post(':id/clone')
  @HttpCode(HttpStatus.OK)
  async clone(
    @Param('id') routineId: string,
    @Body('userId') userId: string,
    @Body('newName') newName?: string,
  ) {
    await this.cloneRoutineUseCase.execute({ routineId, userId, newName });
    return { message: 'Routine cloned successfully' };
  }

  // Rota do PROXY
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') routineId: string,
    @Body('userId') userId: string,
    @Body('newName') newName: string,
  ) {
    await this.updateRoutineUseCase.execute({ routineId, userId, newName });
    return { message: 'Routine updated successfully' };
  }

  // Rota do MEDIATOR
  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async activate(
    @Param('id') routineId: string,
    @Body('userId') userId: string,
  ) {
    // O Use Case ativa a rotina e o EventBus (Mediator) cuida de desativar as outras
    await this.activateRoutineUseCase.execute({ routineId, userId });
    return { message: 'Routine activated successfully' };
  }
}