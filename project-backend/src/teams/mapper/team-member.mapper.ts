import { TeamMemberResponseDto } from '../dto/team-member-response';
import { TeamMember } from '../entities/team-member.entity';

export function mapTeamMemberResponse(member: TeamMember): TeamMemberResponseDto {
  return {
    id: member.id,
    role: member.role,
    user: {
      id: member.user.id,
      name: member.user.name,
      email: member.user.email,
      role: member.user.role,
    },
  };
}
