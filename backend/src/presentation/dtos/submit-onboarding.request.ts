import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, Max, Min } from 'class-validator';
import { ConsistencyLevel } from '@domain/onboarding/enums/consistency-level.enum';
import { Sex } from '@domain/onboarding/enums/sex.enum';
import { TechniqueLevel } from '@domain/onboarding/enums/technique-level.enum';
import { TrainingGoal } from '@domain/onboarding/enums/training-goal.enum';

export class SubmitOnboardingRequest {
  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  sex!: Sex;

  @ApiProperty({ minimum: 10, maximum: 120 })
  @IsInt()
  @Min(10)
  @Max(120)
  age!: number;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  experienceMonths!: number;

  @ApiProperty({ minimum: 1, maximum: 7 })
  @IsInt()
  @Min(1)
  @Max(7)
  weeklyFrequency!: number;

  @ApiProperty({ enum: TrainingGoal })
  @IsEnum(TrainingGoal)
  mainGoal!: TrainingGoal;

  @ApiProperty()
  @IsBoolean()
  followedStructuredPlan!: boolean;

  @ApiProperty({ enum: TechniqueLevel })
  @IsEnum(TechniqueLevel)
  techniqueLevel!: TechniqueLevel;

  @ApiProperty()
  @IsBoolean()
  usesProgressiveLoad!: boolean;

  @ApiProperty({ enum: ConsistencyLevel })
  @IsEnum(ConsistencyLevel)
  recentConsistency!: ConsistencyLevel;

  @ApiProperty()
  @IsBoolean()
  hasLimitation!: boolean;
}
