import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Team, (team) => team.id)
  team: Team;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column({ enum: ['manager', 'member'], default: 'member' })
  role: string;
}