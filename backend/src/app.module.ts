import { Module } from '@nestjs/common';
import { RoutineModule } from './routine.module';

@Module({
  imports: [RoutineModule],
  controllers: [],
  providers: [],
})
export class AppModule {}