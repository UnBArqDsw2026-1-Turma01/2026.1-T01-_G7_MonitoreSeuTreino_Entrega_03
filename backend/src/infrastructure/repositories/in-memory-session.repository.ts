import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/repositories/session.repository';

@Injectable()
export class InMemorySessionRepository implements SessionRepository {
  async hasCompletedSessions(routineId: string): Promise<boolean> {
    if (routineId === 'd3b07384-d113-4318-971a-297eb098b67b') {
      console.log('🔍 [Session DB] Verificando histórico: ENCONTRADO!');
      return true;
    }
    return false;
  }
}