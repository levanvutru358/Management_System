import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  async createTeam(createTeamDto: CreateTeamDto, userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const team = this.teamRepository.create({ ...createTeamDto, createdBy: user });
    const savedTeam = await this.teamRepository.save(team);
    const teamMember = this.teamMemberRepository.create({
      team: savedTeam,
      user: user,
      role: 'manager',
    });
    await this.teamMemberRepository.save(teamMember);
    return savedTeam;
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

  async getMemberCount(teamId: number): Promise<number> {
    const count = await this.teamMemberRepository.count({ where: { team: { id: teamId } } });
    if (count === 0) throw new NotFoundException('No members found for this team');
    return count;
  }

  async findAllMember(): Promise<TeamMember[]> {
    const members = await this.teamMemberRepository.find({ relations: ['user', 'team'] });
    return members;
  }

  async findAll(): Promise<Team[]> {
    const teams = await  this.teamRepository.find({ relations: ['createdBy', 'members'] });
    return teams;
  }

  async findOne(id: number): Promise<Team | null> {
    const team = await this.teamRepository.findOne({ where: { id }, relations: ['createdBy', 'members'] });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async findOneMember(id: number): Promise<TeamMember | null> {
    const memnber = await this.teamMemberRepository.findOne({ where: { id }, relations: ['user', 'team'] });
    if (!memnber) throw new NotFoundException('Member not found');
    return memnber;
  }

  async update(teamId: number, updateTeamDto: UpdateTeamDto, userId: number): Promise<Team> {
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
    return updatedTeam;
  }

  async updateMember(teamId: number, memberId: number, UpdateTeamMemberDto: UpdateTeamMemberDto, userId: number): Promise<TeamMember> {
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

    teamMember.role = UpdateTeamMemberDto.role;
    const updatedTeamMember = await this.teamMemberRepository.save(teamMember);
    return updatedTeamMember;
  }

    
  async remove(teamId: number, userId: number): Promise<void> { 
    const team = await this.teamRepository.findOne({ where: { id: teamId }, relations: ['createdBy']});
    if (!team) throw new NotFoundException('Team not found');

    if (team.createdBy.id != userId) {
      throw new ForbiddenException('You are not allowed to remove this team');
    }
    
    await this.teamMemberRepository.delete({ team: { id: teamId } });
    // if (!removeAllMembers) throw new NotFoundException('No members found for this team');
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
