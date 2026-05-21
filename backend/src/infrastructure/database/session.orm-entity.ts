import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column('uuid')
  routineId: string;

  @Column({ default: false })
  completed: boolean;
}