import { User } from '../../../domain/entities/user.entity';
import {
  ConflictException,
  NotFoundException,
  ValidationException,
} from '../../../domain/exceptions/domain-exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { HashService } from '../../../domain/services/hash.service';
import { Email } from '../../../domain/value-objects/email.vo';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { PersonName } from '../../../domain/value-objects/person-name.vo';
import { PlainPassword } from '../../../domain/value-objects/plain-password.vo';
import { DomainEventBus } from '../../events/domain-event-bus';
import { UseCase } from '../base.use-case';

export interface UpdateUserCommand {
  id: string;
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export class UpdateUserUseCase extends UseCase<UpdateUserCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(cmd: UpdateUserCommand): Promise<User> {
    let user = await this.userRepository.findById(cmd.id);

    if (!user || user.isSoftDeleted()) {
      throw new NotFoundException('User not found', { userId: cmd.id });
    }

    // ── Validação de todos os VOs antes de qualquer I/O adicional ──────────
    const newName = cmd.name ? PersonName.create(cmd.name) : undefined;
    const newEmail = cmd.email ? Email.create(cmd.email) : undefined;
    const newPlainPassword = cmd.newPassword
      ? PlainPassword.create(cmd.newPassword)
      : undefined;

    // ── Unicidade de e-mail ────────────────────────────────────────────────
    if (newEmail && !newEmail.equals(user.email)) {
      const existing = await this.userRepository.findByEmail(
        newEmail.toString(),
      );
      if (existing) {
        throw new ConflictException('Email already in use', {
          email: newEmail.toString(),
        });
      }
    }

    // ── Troca de senha ─────────────────────────────────────────────────────
    if (newPlainPassword) {
      if (!cmd.currentPassword) {
        throw new ValidationException(
          'Current password is required to set a new one',
        );
      }

      const currentPlain = PlainPassword.reconstitute(cmd.currentPassword);
      const hashedStr = await this.hashService.hash(
        newPlainPassword.toString(),
      );
      const newHashed = HashedPassword.fromHash(hashedStr);

      user = await user.verifyAndChangePassword(
        currentPlain,
        newHashed,
        this.hashService,
      );
    }

    // ── Atualização de perfil ──────────────────────────────────────────────
    if (newName || newEmail) {
      user = user.changeProfile(newName, newEmail);
    }

    this.registerAggregate(user);

    await this.userRepository.update(user);
    return user;
  }
}
