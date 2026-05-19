import { LoggerService } from '@nestjs/common';
import { AppLogger } from '../../application/logger/logger.interface';

export class WinstonAppLogger implements AppLogger {
  constructor(private readonly logger: LoggerService) {}

  log(message: string, meta?: Record<string, unknown>): void {
    const context = meta?.context as string | undefined;
    const rest = this.withoutContext(meta);
    const msg = rest ? `${message} ${JSON.stringify(rest)}` : message;
    this.logger.log(msg, context ?? 'App');
  }

  error(message: string, meta?: Record<string, unknown>): void {
    const context = meta?.context as string | undefined;
    const rest = this.withoutContext(meta);
    const msg = rest ? `${message} ${JSON.stringify(rest)}` : message;
    this.logger.error(msg, undefined, context ?? 'App');
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const context = meta?.context as string | undefined;
    const rest = this.withoutContext(meta);
    const msg = rest ? `${message} ${JSON.stringify(rest)}` : message;
    this.logger.warn?.(msg, context ?? 'App');
  }

  private withoutContext(
    meta?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!meta) return undefined;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { context: _, ...rest } = meta;
    return Object.keys(rest).length ? rest : undefined;
  }
}
