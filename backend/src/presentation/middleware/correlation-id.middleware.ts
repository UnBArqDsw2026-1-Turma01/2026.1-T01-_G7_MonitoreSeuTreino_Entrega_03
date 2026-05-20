import { requestContext } from '@infrastructure/context/request-context';
import { CorrelationId } from '@infrastructure/value-objects/correlation-id.vo';
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId = CorrelationId.fromHeader(
      req.headers['x-correlation-id'] as string | undefined,
    );

    req.correlationId = correlationId.toString();
    res.setHeader('x-correlation-id', correlationId.toString());

    requestContext.run({ correlationId: correlationId.toString() }, next);
  }
}
