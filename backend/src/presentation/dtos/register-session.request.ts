import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TrainingSetDto {
  @ApiProperty({ description: 'Repetições planejadas', example: 12 })
  @IsInt()
  @Min(1)
  targetReps!: number;

  @ApiPropertyOptional({ description: 'Repetições efetivamente realizadas', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  actualReps?: number | null;

  @ApiPropertyOptional({ description: 'Carga utilizada', example: 50.5 })
  @IsOptional()
  @IsNumber()
  weight?: number | null;

  @ApiPropertyOptional({ description: 'Observações do usuário (ex: falha, dor)', example: 'Fadiga na última repetição' })
  @IsOptional()
  @IsString()
  observations?: string;
}

export class ExerciseNodeDto {
  @ApiProperty({ description: 'ID do Exercício no catálogo', example: 'uuid-do-exercicio' })
  @IsString()
  @IsNotEmpty()
  exerciseId!: string;

  @ApiProperty({ description: 'Quantidade de séries esperadas na rotina original', example: 3 })
  @IsInt()
  @Min(1)
  expectedSets!: number;

  @ApiProperty({ type: [TrainingSetDto], description: 'Séries registradas neste exercício' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingSetDto)
  sets!: TrainingSetDto[];
}

export class RegisterSessionRequest {
  @ApiPropertyOptional({ description: 'Data e hora da execução (ISO 8601)', example: '2026-05-20T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'ID da Rotina de origem, caso a sessão não seja avulsa', example: 'uuid-da-rotina' })
  @IsOptional()
  @IsString()
  routineId?: string;

  @ApiProperty({ type: [ExerciseNodeDto], description: 'Lista de exercícios executados na sessão' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseNodeDto)
  exercises!: ExerciseNodeDto[];
}