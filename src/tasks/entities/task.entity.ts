import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Comment } from './comment.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../calendar/entities/event.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity'; // Thêm import

@Entity()
export class Task {
  [x: string]: any;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['Todo', 'InProgress', 'Done'],
    default: 'Todo',
  })
  status: 'Todo' | 'InProgress' | 'Done';

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high'],
    default: 'low',
  })
  priority: 'low' | 'medium' | 'high';

  @Column({ nullable: true })
  assignedUserId: number;

  @ManyToOne(() => User, (user) => user.tasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  user: User;

  @OneToMany(() => Comment, (comment) => comment.task, {
    cascade: true,
  })
  comments: Comment[];

  @OneToMany(() => Event, (event) => event.task, {
    cascade: true,
  })
  events: Event[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.task, { 
    cascade: true,
  })
  activityLogs: ActivityLog[];
}