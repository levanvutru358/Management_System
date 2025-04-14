import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.id)
  team: Team;

  @OneToOne(() => User, (user) => user.id)
  user: User;

  @Column({ type: 'enum', enum: ['manager', 'member'], default: 'member' })
  role: 'manager' | 'member';
}