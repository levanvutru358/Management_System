<<<<<<< HEAD
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
=======
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Subtask } from './subtask.entity';
import { Attachment } from './attachment.entity';
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
<<<<<<< HEAD
  description: string;
=======
  dueDate: string;
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df

  @Column({ default: 'Todo' })
  status: string;

<<<<<<< HEAD
  @Column({ default: 'medium' })
  priority: string;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @ManyToOne(() => User, (user) => user.tasks)
  user: User;
=======
  @Column()
  priority: string;

  @Column({ nullable: true })
  userId: number;
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df

  @Column({ nullable: true })
  assignedUserId: number;

<<<<<<< HEAD
  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];
}
=======
  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Subtask, (subtask) => subtask.task, { cascade: true })
  subtasks: Subtask[];

  @OneToMany(() => Attachment, (attachment) => attachment.task, {
    cascade: true,
  })
  attachments: Attachment[];
}
>>>>>>> 3631d38f0d4ff9973d2afc04fbed560ff07908df
