import { Body, Controller, Post, Put, Patch, Param, Get, Query, Delete } from '@nestjs/common';
import { CreateRoutineUseCase } from '../../application/use-cases/routines/create-routine.use-case';
import { CloneRoutineUseCase } from '../../application/use-cases/routines/clone-routine.use-case';
import { UpdateRoutineUseCase } from '../../application/use-cases/routines/update-routine.use-case';
import { ActivateRoutineUseCase } from '../../application/use-cases/routines/activate-routine.use-case';
import { GetMyRoutinesUseCase } from '../../application/use-cases/routines/get-my-routines.use-case';
import { DeleteRoutineUseCase } from '../../application/use-cases/routines/delete-routine.use-case';
import { InactivateRoutineUseCase } from '../../application/use-cases/routines/inactivate-routine.use-case';

@Controller('routines')
export class RoutineController {
  constructor(
    private readonly createRoutineUseCase: CreateRoutineUseCase,
    private readonly cloneRoutineUseCase: CloneRoutineUseCase,
    private readonly updateRoutineUseCase: UpdateRoutineUseCase,
    private readonly activateRoutineUseCase: ActivateRoutineUseCase,
    private readonly getMyRoutinesUseCase: GetMyRoutinesUseCase,
    private readonly deleteRoutineUseCase: DeleteRoutineUseCase,
    private readonly inactivateRoutineUseCase: InactivateRoutineUseCase,
  ) {}

  @Get()
  async getMyRoutines(@Query('userId') userId: string) {
    const id = userId || 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    return this.getMyRoutinesUseCase.execute(id);
  }

  @Post()
  async create(@Body() body: any) {
    return this.createRoutineUseCase.execute(body);
  }

  @Post(':id/clone')
  async clone(@Param('id') id: string, @Body() body: any) {
    return this.cloneRoutineUseCase.execute({ ...body, routineId: id });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.updateRoutineUseCase.execute({ ...body, routineId: id });
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Body() body: any) {
    return this.activateRoutineUseCase.execute({ ...body, routineId: id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteRoutineUseCase.execute(id);
  }

  @Patch(':id/inactivate')
  async inactivate(@Param('id') id: string) {
    return this.inactivateRoutineUseCase.execute(id);
  }
}