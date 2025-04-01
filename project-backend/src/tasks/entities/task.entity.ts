import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: string;

  @Column({ type: 'date', nullable: true })
  dueDate: string;

  @Column()
  priority: string;

  @Column()
  userId: number;

  @Column({ nullable: true })
  assignedUserId: number;
}