import { User } from "src/users/entities/user.entity";
import { TeamMember } from "../entities/team-member.entity";

export class CreateTeamDto {
    name: string;
    description: string;
    createdBy: User; 
    members: TeamMember[]; 
}
