import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subtask } from './subtask.entity';
import { Attachment } from './attachment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  dueDate: string;

  @Column()
  status: string;

  @Column()
  priority: string;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  assignedUserId: number;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
  subtasks: Subtask[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: true,
  })
  attachments: Attachment[];
}
