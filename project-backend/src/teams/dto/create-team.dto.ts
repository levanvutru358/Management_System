import { User } from "src/users/entities/user.entity";

export class CreateTeamDto {
    name: string;
    description: string;
    createdBy: User; 
    members: number[]; 
}
