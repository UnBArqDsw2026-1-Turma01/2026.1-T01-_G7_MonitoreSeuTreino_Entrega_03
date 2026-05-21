import { Injectable } from '@nestjs/common';
import { TrainingSession } from '@domain/entities/training-session';
import { HistoryManager } from '../history-manager';
import { SessionObserver } from './session-observer.interface';

/**
 * GOF COMPORTAMENTAL — OBSERVER (ConcreteObserver)
 *
 * Reage automaticamente quando uma sessão é concluída:
 * WorkoutSessionSubject.notify() → HistoryObserver.update()
 * → HistoryManager (Multiton) recebe a sessão em cache.
 *
 * Problema que resolve:
 * - O histórico é atualizado sem o RegisterSessionUseCase chamar HistoryService diretamente.
 * - Novos observers (ex.: notificações, analytics) podem ser inscritos sem alterar o use case.
 */
@Injectable()
export class HistoryObserver implements SessionObserver {
  update(session: TrainingSession): void {
    if (!session.isCompleted()) {
      return;
    }

    const manager = HistoryManager.getInstance(session.userId);
    manager.addSession(session);
  }
}
