import { Controller, Get, Post, Body, Request, Patch, Param, Delete, Put, ParseIntPipe, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
    const teams: Promise<Team[]> = this.teamsService.findAllTeams() as unknown as Promise<Team[]>;
    return teams;
  }

  @Get(':teamId')
  findOneTeam(@Param('teamId', ParseIntPipe) teamId: number): Promise<Team> {
    const team = this.teamsService.findOneTeam(teamId);
    return team;
  }

  @Get(':teamId/members')
  async findAllMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<TeamMember[]> {
    const members = this.teamsService.findAllMembers(teamId);
    return members;
  }

  @Get(':teamId/members/:memberId')
  findOneMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
  ): Promise<TeamMember> {
    const member = this.teamsService.findOneMember(teamId, memberId);
    return member;
  }

  @Get(':teamId/number-members')
  getNumberMembers(@Param('teamId', ParseIntPipe) teamId: number): Promise<number> {
    const numberMembers = this.teamsService.getNumberMembers(teamId);
    return numberMembers;
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  createTeam(@Body() createTeamDto: CreateTeamDto, @Request() req): Promise<Team> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    const team = this.teamsService.createTeam(createTeamDto, userId);
    return team;
  }

  @Post(':teamId/invite')
  inviteMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() inviteMemberDto: InviteMemberDto,
  ): Promise<void> {
    const inviteMember = this.teamsService.inviteMember(teamId, inviteMemberDto);
    return inviteMember;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':teamId')
  updateTeam(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @Request() req,
  ): Promise<Team> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    const team = this.teamsService.updateTeam(teamId, updateTeamDto, userId);
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(':teamId/members/:memberId')
  updateMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Body() updateTeamMemberDto: UpdateTeamMemberDto,
    @Request() req,
  ): Promise<TeamMember> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    const member = this.teamsService.updateMember(teamId, memberId, updateTeamMemberDto, userId);
    return member;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':teamId')
  removeTeam(@Param('teamId', ParseIntPipe) teamId: number, @Request() req): Promise<void> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    const team = this.teamsService.removeTeam(teamId, userId);
    return team;
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':teamId/members/:memberId')
  removeMember(
    @Param('teamId', ParseIntPipe) teamId: number,
    @Param('memberId', ParseIntPipe) memberId: number,
    @Request() req,
  ): Promise<void> {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }
    const userId = req.user.id;
    const member = this.teamsService.removeMember(teamId, memberId, userId);
    return member;
  }
}