import { User } from '@domain/entities/user.entity';
import {
  PaginatedResult,
  UserRepository,
} from '@domain/repositories/user.repository';
import { Page } from '@domain/value-objects/page.vo';

export class CachingUserRepository implements UserRepository {
  private readonly idCache = new Map<string, User>();
  private readonly emailCache = new Map<string, User>();

  constructor(private readonly wrapped: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    const cached = this.idCache.get(id);
    if (cached) return cached;

    const user = await this.wrapped.findById(id);
    if (user) this.put(user);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const cached = this.emailCache.get(email);
    if (cached) return cached;

    const user = await this.wrapped.findByEmail(email);
    if (user) this.put(user);
    return user;
  }

  async save(user: User): Promise<void> {
    await this.wrapped.save(user);
    this.put(user);
  }

  async update(user: User): Promise<void> {
    const old = this.idCache.get(user.id);
    if (old) this.emailCache.delete(old.email.toString());

    await this.wrapped.update(user);
    this.put(user);
  }

  async hardDelete(id: string): Promise<void> {
    const old = this.idCache.get(id);
    await this.wrapped.hardDelete(id);
    if (old) this.emailCache.delete(old.email.toString());
    this.idCache.delete(id);
  }

  async findAll(page: Page): Promise<PaginatedResult<User>> {
    return this.wrapped.findAll(page);
  }

  private put(user: User): void {
    this.idCache.set(user.id, user);
    this.emailCache.set(user.email.toString(), user);
  }
}
