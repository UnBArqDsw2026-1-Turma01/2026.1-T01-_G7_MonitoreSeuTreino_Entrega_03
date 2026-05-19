import { TokenPayload } from '../../domain/value-objects/token-payload.vo';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      correlationId?: string;
    }
  }
}
