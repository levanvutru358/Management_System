import { ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { Injectable } from '@nestjs/common/decorators/core';
import { TeamResponseDto } from './dto/team-response.dto';
import { mapTeamResponse } from './team.mapper';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<TeamResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const { teamMembers, ...teamData } = createTeamDto;

    const teamInsertResult = await this.teamRepository
      .createQueryBuilder()
      .insert()
      .into(Team)
      .values({ ...teamData, createdBy: user, createdAt: new Date() })
      .execute();

    const teamId = teamInsertResult.identifiers[0].id;
    const savedTeam = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!savedTeam) throw new NotFoundException('Team not found after creation');

    await this.teamMemberRepository
      .createQueryBuilder()
      .insert()
      .into(TeamMember)
      .values({ team: { id: savedTeam.id }, user: user, role: 'manager' })
      .execute();

    if (teamMembers && teamMembers.length > 0) {
      for (const memberDto of teamMembers) {
        const memberUser = await this.userRepository.findOne({
          where: { id: memberDto.userId },
        });
        if (!memberUser) throw new NotFoundException(`User with ID ${memberDto.userId} not found`);

        await this.teamMemberRepository
          .createQueryBuilder()
          .insert()
          .into(TeamMember)
          .values({
            team: { id: savedTeam.id },
            user: memberUser,
            role: memberDto.role || 'member',
          })
          .execute();
      }
    }

    const finalTeam = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['createdBy', 'teamMembers', 'teamMembers.user'],
    });
    if (!finalTeam) throw new NotFoundException('Team not found'); 
    const teamResponseDto = mapTeamResponse(finalTeam);
    return teamResponseDto;
  }

  async inviteMember(teamId: number, inviteMemberDto: InviteMemberDto): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
    
    let user = await this.userRepository.findOne({ where: { email: inviteMemberDto.email } });
    if (!user) {
      user = this.userRepository.create({ email: inviteMemberDto.email, name: 'New User' });
      await this.userRepository.save(user);
    }

    const existingMember = await this.teamMemberRepository.findOne({
      where: { team: { id: teamId }, user: { id: user.id } },
    });
    if (existingMember) throw new NotFoundException('User already a member of the team');

    const teamMember = this.teamMemberRepository.create({
      team: team,
      user: user,
      role: inviteMemberDto.role,
    });
    await this.teamMemberRepository.save(teamMember);

    await this.mailerService.sendMail({
      to: inviteMemberDto.email,
      subject: `You are invited to join the team ${team.name}`,
      text: `Hello,\n\nYou have been invited to join the team ${team.name} with the role of ${inviteMemberDto.role}.
      \n\nBest regards,\nTeam Management`,
    });
  }

  async getNumberMembers(teamId: number): Promise<number> {
    const numberMember = await this.teamMemberRepository.count({ where: { team: { id: teamId } } });
    if (numberMember === 0) throw new NotFoundException('No members found for this team');
    return numberMember;
  }

  async findAllMembers(teamId: number): Promise<TeamMember[]> {
    const members = await this.teamMemberRepository.find({
      where: { team: { id: teamId } },
      relations: ['user', 'team'],
    });

    return members;
  }

  async findAllTeams(): Promise<Team[]> {
    const teams = await  this.teamRepository.find({ relations: ['createdBy', 'members'] });
    return teams;
  }

  async findOneTeam(id: number): Promise<Team | null> {
    const team = await this.teamRepository.findOne({ where: { id }, relations: ['createdBy', 'members'] });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async findOneMember(teamId: number, memberId: number): Promise<TeamMember | null> {
    const member = await this.teamMemberRepository.findOne({
      where: {
        id: memberId,
        team: { id: teamId },
      },
      relations: ['user', 'team'],
    });
    if (!member) throw new NotFoundException('Member not found in this team');
    return member;
  }

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto, userId: number): Promise<TeamResponseDto> {
    const team = await this.teamRepository.findOne({ where: { id: teamId }, relations: ['createdBy']});
    if (!team) throw new NotFoundException('Team not found');

    if (team.createdBy.id != userId) {
      throw new ForbiddenException('You are not allowed to update this team');
    }

    if (updateTeamDto.name) {
      team.name = updateTeamDto.name;
    }
    if (updateTeamDto.description) {
      team.description = updateTeamDto.description;
    }

    const updatedTeam = await this.teamRepository.save(team);
    const teamResponseDto = mapTeamResponse(updatedTeam);
    return teamResponseDto;
  }

  async updateMember(teamId: number, memberId: number, updateTeamMemberDto: UpdateTeamMemberDto, userId: number): Promise<TeamMember> {
    const teamMember = await this.teamMemberRepository.findOne(
      { where: 
        { 
          team: { id: teamId }, 
          user: { id: memberId } 
        }, 
        relations: ['team', 'team.createdBy']
      }
    );
    if (!teamMember) throw new NotFoundException('Member not found');

    const currentUser = await this.teamMemberRepository.findOne(
      { 
        where: 
        { 
          team: { id: teamId }, 
          user: { id: memberId } 
        }, 
        relations: ['team', 'team.createdBy'] 
      }
    );
    if (!currentUser || currentUser.role !== 'manager' && teamMember.team.createdBy.id !== userId) {
      throw new ForbiddenException('You are not allowed to update this team member');
    }

    if (updateTeamMemberDto.role) {
      teamMember.role = updateTeamMemberDto.role;
    }
    const updatedTeamMember = await this.teamMemberRepository.save(teamMember);
    return updatedTeamMember;
  }

    
  async removeTeam(teamId: number, userId: number): Promise<void> { 
    const team = await this.teamRepository.findOne({ where: { id: teamId }, relations: ['createdBy']});
    if (!team) throw new NotFoundException('Team not found');

    if (team.createdBy.id != userId) {
      throw new ForbiddenException('You are not allowed to remove this team');
    }
    
    await this.teamMemberRepository.delete({ team: { id: teamId } });
    const removeAllMembers = await this.teamMemberRepository.delete({ team: { id: teamId } });
    if (!removeAllMembers) throw new NotFoundException('No members found for this team');
    await this.teamRepository.delete(teamId);
  }

  async removeMember(teamId: number, memberId: number, userId: number): Promise<void> {
    const teamMember = await this.teamMemberRepository.findOne(
      { where: 
        { 
          team: { id: teamId }, 
          user: { id: memberId } 
        }, 
        relations: ['team', 'team.createdBy']
      }
    );
    if (!teamMember) throw new NotFoundException('Member not found');

    const currentUser = await this.teamMemberRepository.findOne(
      { 
        where: 
        { 
          team: { id: teamId }, 
          user: { id: memberId } 
        }, 
        relations: ['team', 'team.createdBy'] 
      }
    );
    if (!currentUser || currentUser.role !== 'manager' && teamMember.team.createdBy.id !== userId) {
      throw new ForbiddenException('You are not allowed to remove this team member');
    }

    if (teamMember.role == 'manager') {
      throw new ForbiddenException('You cannot remove a manager from the team');
    }
    
    await this.teamMemberRepository.delete(teamMember.id);
  }
} 
