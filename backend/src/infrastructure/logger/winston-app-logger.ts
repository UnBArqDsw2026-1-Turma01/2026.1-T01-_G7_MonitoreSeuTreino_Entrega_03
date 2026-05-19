import { LoggerService } from '@nestjs/common';
import { AppLogger } from '../../application/logger/logger.interface';

export class WinstonAppLogger implements AppLogger {
  constructor(private readonly logger: LoggerService) {}

  log(message: string, meta?: Record<string, unknown>): void {
    this.logger.log(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn?.(message, meta);
  }
}
