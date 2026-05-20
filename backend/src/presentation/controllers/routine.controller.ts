import { Controller, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CloneRoutineUseCase } from '../../application/use-cases/routines/clone-routine.use-case';

@Controller('routines')
export class RoutineController {
  constructor(private readonly cloneRoutineUseCase: CloneRoutineUseCase) {}

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
}