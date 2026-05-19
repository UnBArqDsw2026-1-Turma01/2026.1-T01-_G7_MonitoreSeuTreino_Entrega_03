/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access  */
import { utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';

export const winstonConfig: winston.LoggerOptions = {
  level: process.env.LOG_LEVEL ?? 'info',

  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.ms(),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : nestWinstonUtilities.format.nestLike('App', {
          prettyPrint: true,
          colors: true,
        }),
  ),

  transports: [
    new winston.transports.Console(),

    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 10 * 1024 * 1024,
            maxFiles: 10,
          }),
        ]
      : []),
  ],
};
