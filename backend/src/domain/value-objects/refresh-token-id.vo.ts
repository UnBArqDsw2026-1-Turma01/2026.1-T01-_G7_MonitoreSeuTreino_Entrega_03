import { AggregateId } from './entity-id.vo';

export class RefreshTokenId extends AggregateId {
  private constructor(value?: string) {
    super(value);
  }
  static create(): RefreshTokenId {
    return new RefreshTokenId();
  }
  static reconstitute(value: string): RefreshTokenId {
    return new RefreshTokenId(value);
  }
}
