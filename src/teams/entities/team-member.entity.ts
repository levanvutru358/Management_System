import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../../users/entities/user.entity';
import { IsInt, Min } from 'class-validator';

@Entity()
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsInt({ message: 'teamId must be an integer' })
  @Min(1, { message: 'teamId must be greater than 0' })
  teamId: number;

  @Column()
  @IsInt({ message: 'userId must be an integer' })
  @Min(1, { message: 'userId must be greater than 0' })
  userId: number;

  @ManyToOne(() => Team, (team) => team.members, { cascade: false })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @ManyToOne(() => User, { cascade: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: ['manager', 'member'], default: 'member' })
  role: 'manager' | 'member';
}