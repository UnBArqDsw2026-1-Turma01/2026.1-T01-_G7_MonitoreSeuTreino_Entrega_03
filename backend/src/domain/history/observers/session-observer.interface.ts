import { TrainingSession } from '@domain/entities/training-session';

/**
 * GOF COMPORTAMENTAL — OBSERVER (interface do observador)
 *
 * Contrato que permite reagir a eventos de sessão sem acoplar
 * o módulo de registro ao módulo de histórico.
 */
export interface SessionObserver {
  update(session: TrainingSession): void;
}
