import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TeamMember } from "./team-member.entity";

@Entity()
export class Team {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => TeamMember, (members) => members.team)
    members: TeamMember[];

    @ManyToOne(() => User, (user) => user.id, { eager: true })
    createdBy: User;

    @CreateDateColumn()
    createdAt: Date;
}
