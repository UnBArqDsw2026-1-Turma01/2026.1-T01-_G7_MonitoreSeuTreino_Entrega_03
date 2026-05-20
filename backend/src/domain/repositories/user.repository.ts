import { User } from '../entities/user.entity';
import { Page } from '../value-objects/page.vo';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(page: Page): Promise<PaginatedResult<User>>;
  update(user: User): Promise<void>;
  hardDelete(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
