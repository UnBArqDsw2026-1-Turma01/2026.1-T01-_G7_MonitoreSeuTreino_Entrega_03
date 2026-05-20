export type ExceptionContext = Readonly<Record<string, unknown>>;

export enum SystemLayer {
  DOMAIN = 'domain',
  APPLICATION = 'application',
  INFRASTRUCTURE = 'infrastructure',
  PRESENTATION = 'presentation',
}

export class BaseException extends Error {
  public readonly occurredAt: Date;
  public readonly layer: SystemLayer;

  private readonly _context: Map<string, unknown>;

  constructor(
    message: string,
    public readonly code: string,
    context: ExceptionContext = {},
    layer: SystemLayer = SystemLayer.DOMAIN,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.occurredAt = new Date();
    this.layer = layer;
    this._context = new Map(Object.entries(context));
    Error.captureStackTrace(this, this.constructor);
  }

  // ─── Contexto ─────────────────────────────────────────────────────────────

  get context(): ExceptionContext {
    return Object.fromEntries(this._context);
  }

  withContext(extra: ExceptionContext): this {
    const Ctor = this.constructor as new (
      message: string,
      code: string,
      context: ExceptionContext,
      layer: SystemLayer,
    ) => this;

    const merged = new Map(this._context);
    for (const [k, v] of Object.entries(extra)) {
      merged.set(k, v);
    }

    const next = new Ctor(
      this.message,
      this.code,
      Object.fromEntries(merged),
      this.layer,
    );
    next.stack = this.stack;
    return next;
  }

  hasContext(key: string): boolean {
    return this._context.has(key);
  }

  getContext<T = unknown>(key: string): T | undefined {
    return this._context.get(key) as T | undefined;
  }

  toLog(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      layer: this.layer,
      context: this.context,
      occurredAt: this.occurredAt.toISOString(),
    };
  }
}
