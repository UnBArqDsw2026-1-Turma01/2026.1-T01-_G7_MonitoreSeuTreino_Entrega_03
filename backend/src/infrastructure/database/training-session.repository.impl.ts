import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  ITrainingSessionRepository,
  SessionDateRangeFilter,
} from '@domain/repositories/training-session.repository';
import { TrainingSession, SessionState } from '@domain/entities/training-session';
import { ExerciseNode } from '@domain/entities/exercise-node';
import { TrainingSet } from '@domain/entities/training-set';
import { TrainingSessionOrmEntity } from './session.orm-entity';
import { ExerciseNodeOrmEntity } from './exercise-node.orm-entity';
import { TrainingSetOrmEntity } from './training-set.orm-entity';

@Injectable()
export class TrainingSessionRepositoryImpl implements ITrainingSessionRepository {
  constructor(
    @InjectRepository(TrainingSessionOrmEntity)
    private readonly ormRepository: Repository<TrainingSessionOrmEntity>,
  ) {}

  async save(session: TrainingSession): Promise<void> {
    const ormSession = new TrainingSessionOrmEntity();
    ormSession.id = session.id;
    ormSession.userId = session.userId;
    ormSession.date = session.date;
    ormSession.state = session.isCompleted() ? SessionState.COMPLETED : SessionState.DRAFT;
    ormSession.routineId = session.routineId;

    ormSession.exercises = session.getComponents().map((comp) => {
      if (!(comp instanceof ExerciseNode)) {
        throw new Error('Componente inválido no mapeamento da infraestrutura.');
      }

      const ormNode = new ExerciseNodeOrmEntity();
      ormNode.id = comp.id;
      ormNode.sessionId = session.id;
      ormNode.exerciseId = comp.exerciseId;
      ormNode.expectedSets = comp.expectedSets;

      ormNode.sets = comp.getChildren().map((child) => {
        if (!(child instanceof TrainingSet)) {
          throw new Error('Série inválida no mapeamento da infraestrutura.');
        }

        const ormSet = new TrainingSetOrmEntity();
        ormSet.id = child.id;
        ormSet.exerciseNodeId = comp.id;
        ormSet.targetReps = child.targetReps;
        ormSet.actualReps = child.actualReps;
        ormSet.weight = child.weight;
        ormSet.observations = child.observations;

        return ormSet;
      });

      return ormNode;
    });

    await this.ormRepository.save(ormSession);
  }

  async findById(id: string): Promise<TrainingSession | null> {
    const ormSession = await this.ormRepository.findOne({
      where: { id },
      relations: ['exercises', 'exercises.sets'],
    });

    if (!ormSession) return null;
    return this.mapToDomain(ormSession);
  }

  async findByUserId(userId: string): Promise<TrainingSession[]> {
    const ormSessions = await this.ormRepository.find({
      where: { userId },
      relations: ['exercises', 'exercises.sets'],
      order: { date: 'DESC' },
    });

    return ormSessions.map((orm) => this.mapToDomain(orm));
  }

  async findCompletedByUserId(
    userId: string,
    filter?: SessionDateRangeFilter,
  ): Promise<TrainingSession[]> {
    const where: Record<string, unknown> = {
      userId,
      state: SessionState.COMPLETED,
    };

    if (filter?.startDate && filter?.endDate) {
      where.date = Between(filter.startDate, filter.endDate);
    } else if (filter?.startDate) {
      where.date = MoreThanOrEqual(filter.startDate);
    } else if (filter?.endDate) {
      where.date = LessThanOrEqual(filter.endDate);
    }

    const ormSessions = await this.ormRepository.find({
      where,
      relations: ['exercises', 'exercises.sets'],
      order: { date: 'DESC' },
    });

    return ormSessions.map((orm) => this.mapToDomain(orm));
  }

  private mapToDomain(ormSession: TrainingSessionOrmEntity): TrainingSession {
    const state = ormSession.state === SessionState.COMPLETED ? SessionState.COMPLETED : SessionState.DRAFT;
    const session = new TrainingSession(
      ormSession.id,
      ormSession.userId,
      ormSession.date,
      state,
      ormSession.routineId,
    );

    if (ormSession.exercises) {
      for (const ormEx of ormSession.exercises) {
        const exerciseNode = new ExerciseNode(ormEx.id, ormEx.exerciseId, ormEx.expectedSets);
        
        if (ormEx.sets) {
          for (const ormSet of ormEx.sets) {
            const trainingSet = new TrainingSet(
              ormSet.id,
              ormSet.targetReps,
              ormSet.actualReps,
              ormSet.weight,
              ormSet.observations,
            );
            exerciseNode.add(trainingSet);
          }
        }
        session.addWorkoutComponent(exerciseNode);
      }
    }

    return session;
  }
}