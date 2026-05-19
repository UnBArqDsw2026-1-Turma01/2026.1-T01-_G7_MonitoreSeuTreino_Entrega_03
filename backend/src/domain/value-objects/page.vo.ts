import { ValidationException } from '../exceptions/domain-exceptions';

export class Page {
  readonly page: number;
  readonly limit: number;

  private constructor(page: number, limit: number) {
    this.page = page;
    this.limit = limit;
  }

  static create(page: number, limit: number): Page {
    if (!Number.isInteger(page) || page < 1) {
      throw new ValidationException('page must be an integer ≥ 1', { page });
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new ValidationException(
        'limit must be an integer between 1 and 100',
        { limit },
      );
    }
    return new Page(page, limit);
  }

  get offset(): number {
    return (this.page - 1) * this.limit;
  }
}
