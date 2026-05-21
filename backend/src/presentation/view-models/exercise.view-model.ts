import { Exercise } from '@domain/exercises/entities/exercise.entity';

export class ExerciseViewModel {
  static toResponse(exercise: Exercise) {
    return {
      id: exercise.id,
      userId: exercise.userId,
      name: exercise.name.toString(),
      muscleGroup: exercise.muscleGroup?.toString() ?? null,
      active: exercise.active,
      createdAt: exercise.createdAt.toDate(),
      updatedAt: exercise.updatedAt.toDate(),
      deactivatedAt: exercise.deactivatedAt?.toDate() ?? null,
    };
  }

  static toCollectionResponse(exercises: Exercise[]) {
    return {
      data: exercises.map((exercise) => ExerciseViewModel.toResponse(exercise)),
    };
  }
}