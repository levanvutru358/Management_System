import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

// Định nghĩa enum cho status
export enum EventStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  dueDate?: Date;

  @ManyToOne(() => User, (user) => user.assignedEvents, { nullable: true })
  assignedBy?: User; 

  @ManyToOne(() => User, (user) => user.createdEvents, { nullable: true })
  createdBy?: User; 

  @Column({ default: EventStatus.PENDING, enum: EventStatus })
  status: EventStatus; 

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @ManyToOne(() => Task, (task) => task.events, { onDelete: 'SET NULL', nullable: true })
  task?: Task;

  @Column({ nullable: true })
  reminderEmails?: string; 
}