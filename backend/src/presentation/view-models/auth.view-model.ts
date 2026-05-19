import { User } from '@domain/entities/user.entity';
import { AccessToken } from '@domain/value-objects/access-token.vo';

export class AuthViewModel {
  static toResponse(accessToken: AccessToken, user: User) {
    return {
      accessToken: accessToken.toString(),
      user: {
        id: user.id,
        name: user.name.toString(),
        email: user.email.toString(),
      },
    };
  }
}
