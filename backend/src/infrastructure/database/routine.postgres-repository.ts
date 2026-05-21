import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from '../../domain/entities/routine.entity';
import { RoutineRepository } from '../../domain/repositories/routine.repository';
import { RoutineOrmEntity } from './routine.orm-entity';

@Injectable()
export class RoutinePostgresRepository implements RoutineRepository {
  constructor(
    @InjectRepository(RoutineOrmEntity)
    private readonly repository: Repository<RoutineOrmEntity>,
  ) {}

  async findById(id: string): Promise<Routine | null> {
    const ormEntity = await this.repository.findOne({ where: { id } });
    if (!ormEntity) return null;
    return Routine.reconstitute(ormEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findByUserId(userId: string): Promise<Routine[]> {
    const ormEntities = await this.repository.find({
      where: { userId },
      order: { isActive: 'DESC' },
    });
    return ormEntities as unknown as Routine[];
  }

  async save(routine: Routine): Promise<void> {
    const ormEntity = this.repository.create({
      id: routine.id.toString(),
      userId: routine.userId.toString(),
      name: routine.name.toString(),
      isActive: routine.isActive,
      divisions: routine.divisions,
    });

    await this.repository.save(ormEntity);
  }
}
