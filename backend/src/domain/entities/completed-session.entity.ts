export class CompletedSession {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly concludedAt: Date,
    public readonly routineId: string | null = null,
  ) {}

  get hasRoutine(): boolean {
    return this.routineId !== null;
  }
}