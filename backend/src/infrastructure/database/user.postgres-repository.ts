import { User } from '@domain/entities/user.entity';
import {
  PaginatedResult,
  UserRepository,
} from '@domain/repositories/user.repository';
import { Email } from '@domain/value-objects/email.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { Page } from '@domain/value-objects/page.vo';
import { PersonName } from '@domain/value-objects/person-name.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfrastructureException } from '../exceptions/infrastructure-exceptions';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class UserPostgresRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  private toDomain(orm: UserOrmEntity): User {
    return User.reconstitute(
      orm.id,
      PersonName.reconstitute(orm.name),
      Email.reconstitute(orm.email),
      HashedPassword.fromHash(orm.passwordHash),
      Timestamp.from(orm.createdAt),
      Timestamp.from(orm.updatedAt),
      orm.deletedAt ? Timestamp.from(orm.deletedAt) : null,
    );
  }

  private toPersistence(user: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = user.id;
    orm.name = user.name.toString();
    orm.email = user.email.toString();
    orm.passwordHash = user.hashedPassword.toString();
    orm.createdAt = user.createdAt.toDate();
    orm.updatedAt = user.updatedAt.toDate();
    orm.deletedAt = user.deletedAt?.toDate() ?? null;
    return orm;
  }

  async save(user: User): Promise<void> {
    try {
      await this.repository.save(this.toPersistence(user));
    } catch (err) {
      throw new InfrastructureException(
        'Failed to save user',
        err,
        `method=save userId=${user.id}`,
      );
    }
  }

  async findById(id: string): Promise<User | null> {
    try {
      const found = await this.repository.findOneBy({ id });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find user by id',
        err,
        `method=findById userId=${id}`,
      );
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const found = await this.repository.findOneBy({ email });
      return found ? this.toDomain(found) : null;
    } catch (err) {
      throw new InfrastructureException(
        'Failed to find user by email',
        err,
        'method=findByEmail',
      );
    }
  }

  async findAll(page: Page): Promise<PaginatedResult<User>> {
    try {
      const [rows, total] = await this.repository.findAndCount({
        skip: page.offset,
        take: page.limit,
        order: { createdAt: 'DESC' },
      });

      return {
        data: rows.map((orm) => this.toDomain(orm)),
        total,
        page: page.page,
        totalPages: Math.ceil(total / page.limit),
      };
    } catch (err) {
      throw new InfrastructureException(
        'Failed to list users',
        err,
        'method=findAll',
      );
    }
  }

  async update(user: User): Promise<void> {
    try {
      await this.repository.save(this.toPersistence(user));
    } catch (err) {
      throw new InfrastructureException(
        'Failed to update user',
        err,
        `method=update userId=${user.id}`,
      );
    }
  }

  async hardDelete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (err) {
      throw new InfrastructureException(
        'Failed to delete user',
        err,
        `method=hardDelete userId=${id}`,
      );
    }
  }
}
