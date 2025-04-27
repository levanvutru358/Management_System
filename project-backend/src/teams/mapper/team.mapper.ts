import { TeamResponseDto } from "../dto/team-response.dto"
import { Team } from "../entities/team.entity"

export function mapTeamResponse(team: Team): TeamResponseDto {
    return {
        id: team.id,
        name: team.name,
        description: team.description,
        teamMembers: team.teamMembers.map(member => ({
        id: member.id,
        role: member.role,
        user: {
            id: member.user.id,
            name: member.user.name,
            role: member.user.role,
            email: member.user.email,
        },
        })),
        createdBy: {
        id: team.createdBy.id,
        name: team.createdBy.name,
        role: team.createdBy.role,
        email: team.createdBy.email, 
        },
        createdAt: team.createdAt,
    };
};

  