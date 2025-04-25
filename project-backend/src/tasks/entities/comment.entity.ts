// src/tasks/entities/comment.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Task, (task) => task.comments)
  task: Task;

  @ManyToOne(() => User)
  user: User;
}