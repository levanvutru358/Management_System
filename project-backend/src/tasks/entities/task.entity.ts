import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Attachment } from './attachment.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

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

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: true,
  })
  attachments: Attachment[];
}
