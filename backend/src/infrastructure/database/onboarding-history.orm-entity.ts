import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TrainingLevel } from '@domain/onboarding/enums/training-level.enum';

@Entity('onboarding_history')
export class OnboardingHistoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({ name: 'training_profile_id' })
  trainingProfileId!: string;

  @Column({ name: 'answers_snapshot', type: 'jsonb' })
  answersSnapshot!: object;

  @Column({ type: 'enum', enum: TrainingLevel })
  classification!: TrainingLevel;

  @Column({ type: 'int' })
  score!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
