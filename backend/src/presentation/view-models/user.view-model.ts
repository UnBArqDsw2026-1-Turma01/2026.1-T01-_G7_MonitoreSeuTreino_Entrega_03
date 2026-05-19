import { User } from '@domain/entities/user.entity';
import { PaginatedResult } from '@domain/repositories/user.repository';

export class UserViewModel {
  static toResponse(this: void, user: User) {
    return {
      id: user.id,
      name: user.name.toString(),
      email: user.email.toString(),
      createdAt: user.createdAt.toDate(),
    };
  }

  static toPaginatedResponse(result: PaginatedResult<User>) {
    return {
      data: result.data.map((u) => UserViewModel.toResponse(u)),
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    };
  }
}
