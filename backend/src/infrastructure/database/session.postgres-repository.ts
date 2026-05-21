import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SessionOrmEntity } from './session.orm-entity';

@Injectable()
export class SessionPostgresRepository implements SessionRepository {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly repository: Repository<SessionOrmEntity>,
  ) {}

  async hasCompletedSessions(routineId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        routineId: routineId,
        completed: true,
      },
    });
    return count > 0;
  }
}