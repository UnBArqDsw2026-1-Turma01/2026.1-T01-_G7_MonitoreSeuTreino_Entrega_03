import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sessions')
export class WeeklyMonitoringOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @Column({
    name: 'concluded_at',
    type: 'timestamptz',
    nullable: true,
  })
  concludedAt!: Date | null;

  @Column({
    name: 'routine_id',
    type: 'uuid',
    nullable: true,
  })
  routineId!: string | null;
}