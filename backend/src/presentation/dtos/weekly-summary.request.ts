import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class WeeklySummaryRequest {
  @ApiPropertyOptional({
    required: false,
    example: 0,
    minimum: -52,
    maximum: 52,
    description:
      'Offset da semana em relação à atual.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-52)
  @Max(52)
  weekOffset?: number;
}