import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ConsistencyLevel } from '@domain/onboarding/enums/consistency-level.enum';
import { Sex } from '@domain/onboarding/enums/sex.enum';
import { TechniqueLevel } from '@domain/onboarding/enums/technique-level.enum';
import { TrainingGoal } from '@domain/onboarding/enums/training-goal.enum';
import { TrainingLevel } from '@domain/onboarding/enums/training-level.enum';

@Entity('training_profiles')
export class TrainingProfileOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ type: 'enum', enum: Sex })
  sex!: Sex;

  @Column({ type: 'int' })
  age!: number;

  @Column({ name: 'experience_months', type: 'int' })
  experienceMonths!: number;

  @Column({ name: 'weekly_frequency', type: 'int' })
  weeklyFrequency!: number;

  @Column({ name: 'main_goal', type: 'enum', enum: TrainingGoal })
  mainGoal!: TrainingGoal;

  @Column({ name: 'followed_structured_plan', type: 'boolean' })
  followedStructuredPlan!: boolean;

  @Column({ name: 'technique_level', type: 'enum', enum: TechniqueLevel })
  techniqueLevel!: TechniqueLevel;

  @Column({ name: 'uses_progressive_load', type: 'boolean' })
  usesProgressiveLoad!: boolean;

  @Column({
    name: 'recent_consistency',
    type: 'enum',
    enum: ConsistencyLevel,
  })
  recentConsistency!: ConsistencyLevel;

  @Column({ name: 'has_limitation', type: 'boolean' })
  hasLimitation!: boolean;

  @Column({ type: 'enum', enum: TrainingLevel })
  classification!: TrainingLevel;

  @Column({ type: 'int' })
  score!: number;

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt!: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
