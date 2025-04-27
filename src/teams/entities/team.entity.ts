import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity';
import { User } from 'src/users/entities/user.entity';


@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column() 
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team, { cascade: false })
  members: TeamMember[];

  @Column()
  createdById: number;

  @ManyToOne(() => User, (user) => user.teams, { cascade: false })
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.team, { cascade: false })
  activityLogs: ActivityLog[];

  @CreateDateColumn()
  createdAt: Date;
}