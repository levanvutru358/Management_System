import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { TasksModule } from '../tasks/tasks.module'; 

@Module({
  imports: [TasksModule], 
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}