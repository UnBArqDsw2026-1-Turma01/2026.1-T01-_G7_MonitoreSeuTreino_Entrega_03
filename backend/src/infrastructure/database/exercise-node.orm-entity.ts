import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { TrainingSessionOrmEntity } from './session.orm-entity';
import { TrainingSetOrmEntity } from './training-set.orm-entity';

@Entity('session_exercises')
export class ExerciseNodeOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  sessionId!: string;

  @Column('uuid')
  exerciseId!: string;

  @Column('int')
  expectedSets!: number;

  @ManyToOne(() => TrainingSessionOrmEntity, (session: TrainingSessionOrmEntity) => session.exercises, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sessionId' })
  session!: TrainingSessionOrmEntity;

  @OneToMany(() => TrainingSetOrmEntity, (set: TrainingSetOrmEntity) => set.exerciseNode, { cascade: true, eager: true })
  sets!: TrainingSetOrmEntity[];
}