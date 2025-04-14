import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

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
  endDate?: Date;

  @Column({ nullable: true })
  dueDate?: Date;

  @ManyToOne(() => User, (user) => user.events, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @ManyToOne(() => Task, (task) => task.events, { onDelete: 'SET NULL', nullable: true })
  task?: Task;
}