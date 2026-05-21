import { Exercise } from '@domain/exercises/entities/exercise.entity';
import {
  ExerciseRepository,
  ExerciseSearchCriteria,
} from '@domain/exercises/repositories/exercise.repository';

export class CachingExerciseRepository implements ExerciseRepository {
  private readonly idCache = new Map<string, Exercise>();
  private readonly scopedCache = new Map<string, Exercise>();

  constructor(private readonly wrapped: ExerciseRepository) {}

  private cacheKey(userId: string, id: string): string {
    return `${userId}:${id}`;
  }

  private put(exercise: Exercise): void {
    this.idCache.set(exercise.id, exercise);
    this.scopedCache.set(
      this.cacheKey(exercise.userId, exercise.id),
      exercise,
    );
  }

  async save(exercise: Exercise): Promise<void> {
    await this.wrapped.save(exercise);
    this.put(exercise);
  }

  async findById(id: string): Promise<Exercise | null> {
    const cached = this.idCache.get(id);
    if (cached) {
      return cached;
    }

    const exercise = await this.wrapped.findById(id);
    if (exercise) {
      this.put(exercise);
    }
    return exercise;
  }

  async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Exercise | null> {
    const cached = this.scopedCache.get(this.cacheKey(userId, id));
    if (cached) {
      return cached;
    }

    const exercise = await this.wrapped.findByIdAndUserId(id, userId);
    if (exercise) {
      this.put(exercise);
    }
    return exercise;
  }

  async findMany(criteria: ExerciseSearchCriteria): Promise<Exercise[]> {
    return this.wrapped.findMany(criteria);
  }

  async update(exercise: Exercise): Promise<void> {
    const cached = this.idCache.get(exercise.id);
    if (cached) {
      this.scopedCache.delete(this.cacheKey(cached.userId, cached.id));
      this.idCache.delete(cached.id);
    }

    await this.wrapped.update(exercise);
    this.put(exercise);
  }
}