import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
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
import { CreateExerciseRequest } from '../dtos/create-exercise.request';
import { SearchExercisesRequest } from '../dtos/search-exercises.request';
import { UpdateExerciseRequest } from '../dtos/update-exercise.request';
import { BearerTokenGuard } from '../guards/bearer-token.guard';
import { ExerciseFacade } from '../facades/exercise.facade';
import { ExerciseViewModel } from '../view-models/exercise.view-model';

@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(BearerTokenGuard)
@Controller('v1/exercises')
export class ExercisesController {
  constructor(private readonly exerciseFacade: ExerciseFacade) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exercise for the authenticated user' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  async create(@Req() req: Request, @Body() dto: CreateExerciseRequest) {
    const exercise = await this.exerciseFacade.create(
      req.user!.userId,
      dto.name,
      dto.muscleGroup,
    );

    return ExerciseViewModel.toResponse(exercise);
  }

  @Get()
  @ApiOperation({ summary: 'Search exercises by name or muscle group' })
  @ApiResponse({ status: 200, description: 'Exercises returned successfully' })
  async find(@Req() req: Request, @Query() query: SearchExercisesRequest) {
    const exercises = await this.exerciseFacade.find(
      req.user!.userId,
      query.name,
      query.muscleGroup,
    );

    return ExerciseViewModel.toCollectionResponse(exercises);
  }

  @Put(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update an exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateExerciseRequest,
  ) {
    const exercise = await this.exerciseFacade.update(
      req.user!.userId,
      id,
      dto.name,
      dto.muscleGroup,
    );

    return ExerciseViewModel.toResponse(exercise);
  }

  @Patch(':id/deactivate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate an exercise' })
  @ApiResponse({
    status: 200,
    description: 'Exercise deactivated successfully',
  })
  async deactivate(@Req() req: Request, @Param('id') id: string) {
    const exercise = await this.exerciseFacade.deactivate(req.user!.userId, id);
    return ExerciseViewModel.toResponse(exercise);
  }
}
