import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { InviteMemberDto } from './dto/invite-member.dto';
import { TeamMember } from './entities/team-member.entity';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { Controller, UseGuards } from '@nestjs/common/decorators/core';
import { Body, Delete, Get, Param, Post, Put, Request } from '@nestjs/common/decorators/http';
import { ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { TeamResponseDto } from './dto/team-response.dto';
import { TeamMemberResponseDto } from './dto/team-member-response';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  findAllTeams(): Promise<TeamResponseDto[]> {
    const teams = this.teamsService.findAllTeams();
    return teams;
  }

  @Get(':teamId')
  findOneTeam(@Param('teamId', ParseIntPipe) teamId: number): Promise<TeamResponseDto | null> {
    const team = this.teamsService.findOneTeam(teamId);
    return team;
  }

  @Get(':teamId/members')
  async findAllMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<TeamMemberResponseDto[]> {
    return this.teamsService.findAllMembers(teamId);
  }

  @Get(':teamId/members/:memberId')
  findOneMember(@Param('teamId', ParseIntPipe) teamId: number, @Param('memberId', ParseIntPipe) memberId: number): Promise<TeamMemberResponseDto | null> {
    const member = this.teamsService.findOneMember(teamId, memberId);
    return member;
  }

  @Get(':teamId/number-members')
  getNumberMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<number> {
    const numberMembers = this.teamsService.getNumberMembers(teamId);
    return numberMembers;
  }

  @Post()
  createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() req: any
  ): Promise<TeamResponseDto> {
    const userId = req.user.id;
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
    @Request() req: any
  ): Promise<TeamResponseDto> {
    const userId = req.user.id;
    const team = this.teamsService.updateTeam(teamId, updateTeamDto, userId);
    return team;
  }

  @Put(':teamId/members/:memberId')
  updateMember(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Param('memberId', ParseIntPipe) memberId: number, 
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @Request() req: any
  ): Promise<TeamMemberResponseDto> {
    const userId = req.user.id;
    const member = this.teamsService.updateMember(teamId, memberId, updateTeamMemberDto, userId);
    return member;
  }

  @Delete(':teamId')
  removeTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Request() req: any
  ): Promise<void> {
    const userId = req.user.id;
    const team = this.teamsService.removeTeam(teamId, userId);
    return team;
  }

  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId', ParseIntPipe) teamId: number, 
    @Param('memberId', ParseIntPipe) memberId: number,
    @Request() req: any
  ): Promise<void> {
    const userId = req.user.id;
    const member = this.teamsService.removeMember(teamId, memberId, userId);
    return member;
  }
}
