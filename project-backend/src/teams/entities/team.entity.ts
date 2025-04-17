import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TeamMember } from "./team-member.entity";

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

    @ManyToOne(() => User, (user) => user.teams, { cascade: false })
    @JoinColumn({ name: 'createdBy' })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
