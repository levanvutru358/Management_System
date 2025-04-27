import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from 'typeorm';
import { Event } from '../../calendar/entities/event.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Task } from '../../tasks/entities/task.entity';
import { Comment } from '../../tasks/entities/comment.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
  role: 'admin' | 'user';

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @OneToMany(() => Event, (event) => event.assignedBy)
  assignedEvents: Event[];

  @OneToMany(() => Event, (event) => event.createdBy)
  createdEvents: Event[];

  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @ManyToOne(() => User, (user) => user.teams, { nullable: true })
  teams: any;

  @OneToMany(() => ActivityLog, (activityLogs) => activityLogs.user)
  activityLogs: ActivityLog[];
}