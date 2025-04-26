import { UserResponseDto } from "src/users/dto/user-response.dto";

export class TeamMemberResponseDto {
  id: number;
  user: UserResponseDto;
  role: string;
}
