import { HashService } from '@domain/services/hash.service';
import {
  UserDeactivatedEvent,
  UserPasswordChangedEvent,
  UserRegisteredEvent,
  UserUpdatedEvent,
} from '../events/user-events';
import { ValidationException } from '../exceptions/domain-exceptions';
import { Email } from '../value-objects/email.vo';
import { HashedPassword } from '../value-objects/hashed-password.vo';
import { PersonName } from '../value-objects/person-name.vo';
import { PlainPassword } from '../value-objects/plain-password.vo';
import { Timestamp } from '../value-objects/timestamp.vo';
import { UserId } from '../value-objects/user-id.vo';
import { AggregateRoot } from './aggregate-root';

export class User extends AggregateRoot {
  private constructor(
    public readonly id: string,
    public readonly name: PersonName,
    public readonly email: Email,
    public readonly hashedPassword: HashedPassword,
    public readonly createdAt: Timestamp,
    public readonly updatedAt: Timestamp,
    public readonly deletedAt: Timestamp | null = null,
  ) {
    super();
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  // Usado para criação de novos usuários, gerando eventos de registro

  static create(
    name: PersonName,
    email: Email,
    hashedPassword: HashedPassword,
  ): User {
    const now = Timestamp.now();
    const user = new User(
      UserId.create().toString(),
      name,
      email,
      hashedPassword,
      now,
      now,
    );
    user.pushEvent(
      new UserRegisteredEvent(user.id, email.toString(), now.toDate()),
    );
    return user;
  }

  // Usado para reconstituição a partir de dados persistidos, sem gerar eventos

  static reconstitute(
    id: string,
    name: PersonName,
    email: Email,
    hashedPassword: HashedPassword,
    createdAt: Timestamp,
    updatedAt: Timestamp,
    deletedAt: Timestamp | null,
  ): User {
    return new User(
      id,
      name,
      email,
      hashedPassword,
      createdAt,
      updatedAt,
      deletedAt,
    );
  }

  // ─── Mutações (imutáveis — retornam nova instância) ───────────────────────

  // Permite atualizar nome e/ou email, gerando evento de atualização

  changeProfile(name?: PersonName, email?: Email): User {
    if (!name && !email) return this;

    const now = Timestamp.now();
    const updated = new User(
      this.id,
      name ?? this.name,
      email ?? this.email,
      this.hashedPassword,
      this.createdAt,
      now,
      this.deletedAt,
    );
    updated.mergeEventsFrom(this);
    updated.pushEvent(new UserUpdatedEvent(this.id, now.toDate()));
    return updated;
  }

  // Permite atualizar a senha, gerando evento de mudança de senha

  changePassword(newHashedPassword: HashedPassword): User {
    const now = Timestamp.now();
    const updated = new User(
      this.id,
      this.name,
      this.email,
      newHashedPassword,
      this.createdAt,
      now,
      this.deletedAt,
    );
    updated.mergeEventsFrom(this);
    updated.pushEvent(new UserPasswordChangedEvent(this.id, now.toDate()));
    return updated;
  }

  // Permite verificar a senha atual antes de mudar para uma nova, garantindo segurança

  async verifyAndChangePassword(
    currentPlain: PlainPassword,
    newHashedPassword: HashedPassword,
    hashService: HashService,
  ): Promise<User> {
    const matches = await hashService.compare(
      currentPlain.toString(),
      this.hashedPassword.toString(),
    );
    if (!matches) {
      throw new ValidationException('Current password is incorrect');
    }
    return this.changePassword(newHashedPassword);
  }

  // Permite marcar o usuário como deletado (soft delete), gerando evento de desativação

  markAsDeleted(): User {
    const now = Timestamp.now();
    const updated = new User(
      this.id,
      this.name,
      this.email,
      this.hashedPassword,
      this.createdAt,
      this.updatedAt,
      now,
    );
    updated.mergeEventsFrom(this);
    updated.pushEvent(new UserDeactivatedEvent(this.id, now.toDate()));
    return updated;
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  // Permite verificar se o usuário está marcado como deletado (soft deleted)

  isSoftDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
