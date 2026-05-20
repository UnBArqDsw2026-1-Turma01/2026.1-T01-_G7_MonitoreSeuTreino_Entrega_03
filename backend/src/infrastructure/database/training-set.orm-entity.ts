import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExerciseNodeOrmEntity } from './exercise-node.orm-entity';

@Entity('session_sets')
export class TrainingSetOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  exerciseNodeId!: string;

  @Column('int')
  targetReps!: number;

  @Column('int', { nullable: true })
  actualReps!: number | null;

  @Column({ type: 'float', nullable: true })
  weight!: number | null;

  @Column('text', { nullable: true })
  observations!: string | null;

  @ManyToOne(() => ExerciseNodeOrmEntity, (node: ExerciseNodeOrmEntity) => node.sets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exerciseNodeId' })
  exerciseNode!: ExerciseNodeOrmEntity;
}