import { User } from '../../../domain/entities/user.entity';
import { ConflictException } from '../../../domain/exceptions/domain-exceptions';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { HashService } from '../../../domain/services/hash.service';
import { Email } from '../../../domain/value-objects/email.vo';
import { HashedPassword } from '../../../domain/value-objects/hashed-password.vo';
import { PersonName } from '../../../domain/value-objects/person-name.vo';
import { PlainPassword } from '../../../domain/value-objects/plain-password.vo';
import { DomainEventBus } from '../../events/domain-event-bus';
import { UseCase } from '../base.use-case';

export interface RegisterUserCommand {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase extends UseCase<RegisterUserCommand, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hashService: HashService,
    eventBus: DomainEventBus,
  ) {
    super(eventBus);
  }

  protected async handle(cmd: RegisterUserCommand): Promise<User> {
    const email = Email.create(cmd.email);

    const existing = await this.userRepository.findByEmail(email.toString());
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const name = PersonName.create(cmd.name);
    const password = PlainPassword.create(cmd.password);
    const hashedStr = await this.hashService.hash(password.toString());
    const hashedPassword = HashedPassword.fromHash(hashedStr);

    const user = User.create(name, email, hashedPassword);
    await this.userRepository.save(user);
    return user;
  }
}
