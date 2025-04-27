import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';
import { Subtask } from './subtask.entity';
import { Attachment } from './attachment.entity';
import { Comment } from './comment.entity';
import { User } from '../../users/entities/user.entity';
import { Event } from '../../calendar/entities/event.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

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

  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
  subtasks: Subtask[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, { cascade: true })
  attachments: Attachment[];

  @OneToMany(() => Comment, (comment) => comment.task, { cascade: true })
  comments: Comment[];

  @OneToMany(() => Event, (event) => event.task, { cascade: true })
  events: Event[];
}