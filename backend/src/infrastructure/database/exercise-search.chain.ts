import { SelectQueryBuilder } from 'typeorm';
import { ExerciseOrmEntity } from './exercise.orm-entity';

export interface ExerciseSearchCriteria {
  userId: string;
  name?: string;
  muscleGroup?: string;
}

export interface ExerciseSearchContext {
  criteria: ExerciseSearchCriteria;
  queryBuilder: SelectQueryBuilder<ExerciseOrmEntity>;
}

abstract class ExerciseSearchHandler {
  private next?: ExerciseSearchHandler;

  setNext(handler: ExerciseSearchHandler): ExerciseSearchHandler {
    this.next = handler;
    return handler;
  }

  async execute(context: ExerciseSearchContext): Promise<void> {
    await this.apply(context);
    if (this.next) {
      await this.next.execute(context);
    }
  }

  protected abstract apply(
    context: ExerciseSearchContext,
  ): Promise<void> | void;
}

class ExerciseScopeHandler extends ExerciseSearchHandler {
  protected apply(context: ExerciseSearchContext): void {
    context.queryBuilder.andWhere('exercise.user_id = :userId', {
      userId: context.criteria.userId,
    });
    context.queryBuilder.andWhere('exercise.active = true');
  }
}

class ExerciseNameHandler extends ExerciseSearchHandler {
  protected apply(context: ExerciseSearchContext): void {
    const name = context.criteria.name?.trim();
    if (!name) {
      return;
    }

    context.queryBuilder.andWhere('LOWER(exercise.name) LIKE LOWER(:name)', {
      name: `%${name}%`,
    });
  }
}

class ExerciseMuscleGroupHandler extends ExerciseSearchHandler {
  protected apply(context: ExerciseSearchContext): void {
    const muscleGroup = context.criteria.muscleGroup?.trim();
    if (!muscleGroup) {
      return;
    }

    context.queryBuilder.andWhere(
      "LOWER(COALESCE(exercise.muscle_group, '')) LIKE LOWER(:muscleGroup)",
      {
        muscleGroup: `%${muscleGroup}%`,
      },
    );
  }
}

export class ExerciseSearchChain {
  private readonly root: ExerciseSearchHandler;

  constructor() {
    this.root = new ExerciseScopeHandler();
    this.root
      .setNext(new ExerciseNameHandler())
      .setNext(new ExerciseMuscleGroupHandler());
  }

  execute(context: ExerciseSearchContext): Promise<void> {
    return this.root.execute(context);
  }
}
