import { Controller, Get, Post, Body, Request, Patch, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TeamMember } from './entities/team-member.entity';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAllTeams(): Promise<Team[]> {
    const teams = this.teamsService.findAllTeams();
    return teams;
  }

  @Get(':teamId')
  findOneTeam(@Param('teamId', ParseIntPipe) teamId: number): Promise<Team | null> {
    const team = this.teamsService.findOneTeam(teamId);
    return team;
  }

  @Get(':teamId/members')
  async findAllMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<TeamMember[]> {
    return this.teamsService.findAllMembers(teamId);
  }

  @Get(':teamId/members/:memberId')
  findOneMember(@Param('teamId', ParseIntPipe) teamId: number, @Param('memberId', ParseIntPipe) memberId: number): Promise<TeamMember | null> {
    const member = this.teamsService.findOneMember(teamId, memberId);
    return member;
  }

  @Get(':teamId/number-members')
  getNumberMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<number> {
    const numberMembers = this.teamsService.getNumberMembers(teamId);
    return numberMembers;
  }

  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto): Promise<Team> {
    const userId = 1;
    const team = this.teamsService.createTeam(createTeamDto, userId);
    return team;
  }

  @Post(':teamId/invite')
  inviteMember(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Body() inviteMemberDto: InviteMemberDto
  ): Promise<void> {
    const inviteMember = this.teamsService.inviteMember(teamId, inviteMemberDto);
    return inviteMember;
  }

  @Put(':teamId')
  updateTeam(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req
  ): Promise<Team> {
    const userId = req.user.id;
    const team = this.teamsService.updateTeam(teamId, updateTeamDto, userId);
    return team;
  }

  @Put(':teamId/members/:memberId')
  updateMember(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Param('memberId', ParseIntPipe) memberId: number, 
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @Request() req
  ): Promise<TeamMember> {
    const userId = req.user.id;
    const member = this.teamsService.updateMember(teamId, memberId, updateTeamMemberDto, userId);
    return member;
  }

  @Delete(':teamId')
  removeTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Request() req
  ): Promise<void> {
    const userId = req.user.id;
    const team = this.teamsService.removeTeam(teamId, userId);
    return team;
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Param('memberId', ParseIntPipe) memberId: number,
    @Request() req
  ): Promise<void> {
    const userId = req.user.id;
    const member = this.teamsService.removeMember(teamId, memberId, userId);
    return member;
  }
}
