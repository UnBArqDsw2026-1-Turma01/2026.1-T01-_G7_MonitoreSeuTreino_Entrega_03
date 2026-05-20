import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { ExerciseNodeOrmEntity } from './exercise-node.orm-entity';


@Entity('training_sessions')
export class TrainingSessionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @Column({ type: 'timestamp' })
  date!: Date;

  @Column()
  state!: string;

  @Column({ type: 'uuid', nullable: true })
  routineId!: string | null;

  @OneToMany(() => ExerciseNodeOrmEntity, (node: ExerciseNodeOrmEntity) => node.session, { cascade: true, eager: true })
  exercises!: ExerciseNodeOrmEntity[];
}