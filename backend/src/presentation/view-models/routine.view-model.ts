import { Routine } from '../../domain/entities/routine.entity';

export class RoutineViewModel {
  static toHTTP(routine: Routine) {
    return {
      id: routine.id.toString(),
      userId: routine.userId.toString(),
      name: routine.name.toString(),
      divisions: routine.divisions,
      isActive: routine.isActive,
      createdAt: routine.createdAt.toDate(),
    };
  }
}
