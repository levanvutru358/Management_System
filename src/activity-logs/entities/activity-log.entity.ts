import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';

export enum ActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  ASSIGNED = "ASSIGNED",
  COMMENTED = "COMMENTED",
  TEAM_CREATED = "TEAM_CREATED",
}

@Entity('activity_log')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ActivityAction,
  })
  action: ActivityAction;

  @Column({ nullable: true })
  taskId: number;

  @ManyToOne(() => Task, (task) => task.activityLogs, { nullable: true })
  @JoinColumn({ name: 'taskId' })
  task: Task;

  @Column({ nullable: true })
  teamId: number;

  @ManyToOne(() => Team, (team) => team.activityLogs, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.activityLogs, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  details: string;
}