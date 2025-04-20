import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Task } from './task.entity';

@Entity()
export class Attachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filename: string;

  @Column()
  path: string;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  task: Task;
}
