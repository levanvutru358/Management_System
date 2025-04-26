
import { UserResponseDto } from "src/users/dto/user-response.dto";
import { TeamMemberResponseDto } from "./team-member-response";

export class TeamResponseDto {
  id: number;
  name: string;
  description: string;
  teamMembers: TeamMemberResponseDto[];
  createdBy: UserResponseDto;
  createdAt: Date;
}
