import { TrainingSession } from '@domain/entities/training-session';

/**
 * GOF CRIACIONAL — MULTITON
 *
 * Garante uma única instância de HistoryManager por usuário (userId).
 * Diferente do Singleton (uma instância global), o Multiton mantém um pool
 * controlado: Map<userId, HistoryManager>.
 *
 * Problema que resolve:
 * - Evita recriar estruturas de cache/listagem a cada requisição HTTP do mesmo usuário.
 * - Centraliza o estado em memória do histórico por usuário autenticado.
 * - O Observer (HistoryObserver) atualiza o mesmo objeto reutilizado via getInstance(userId).
 */
export class HistoryManager {
  private static readonly instances = new Map<string, HistoryManager>();

  private readonly sessions = new Map<string, TrainingSession>();

  private constructor(public readonly userId: string) {}

  static getInstance(userId: string): HistoryManager {
    let instance = HistoryManager.instances.get(userId);

    if (!instance) {
      instance = new HistoryManager(userId);
      HistoryManager.instances.set(userId, instance);
    }

    return instance;
  }

  /** Usado em testes ou logout global — não exposto via HTTP. */
  static clearInstance(userId: string): void {
    HistoryManager.instances.delete(userId);
  }

  addSession(session: TrainingSession): void {
    if (session.userId !== this.userId) {
      throw new Error('Sessão não pertence ao usuário deste HistoryManager.');
    }
    this.sessions.set(session.id, session);
  }

  getSessions(): TrainingSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }

  getSessionById(sessionId: string): TrainingSession | undefined {
    return this.sessions.get(sessionId);
  }

  loadSessions(sessions: TrainingSession[]): void {
    for (const session of sessions) {
      if (session.userId === this.userId) {
        this.sessions.set(session.id, session);
      }
    }
  }

  filterByDateRange(startDate?: Date, endDate?: Date): TrainingSession[] {
    return this.getSessions().filter((session) => {
      const time = session.date.getTime();
      if (startDate && time < startDate.getTime()) return false;
      if (endDate && time > endDate.getTime()) return false;
      return true;
    });
  }
}
