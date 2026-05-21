import { Injectable } from '@nestjs/common';
import { TrainingSession } from '@domain/entities/training-session';
import { SessionObserver } from './session-observer.interface';

/**
 * GOF COMPORTAMENTAL — OBSERVER (Subject / Observable)
 *
 * Mantém a lista de observadores e dispara notify() quando uma sessão
 * é concluída. O RegisterSessionUseCase notifica este subject após persistir,
 * sem conhecer quem consome o evento (baixo acoplamento).
 */
@Injectable()
export class WorkoutSessionSubject {
  private readonly observers: SessionObserver[] = [];

  subscribe(observer: SessionObserver): void {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
    }
  }

  unsubscribe(observer: SessionObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  notify(session: TrainingSession): void {
    for (const observer of this.observers) {
      observer.update(session);
    }
  }
}
