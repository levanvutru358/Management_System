import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  async createTeam(createTeamDto: CreateTeamDto, userId: number): Promise<Team> {
    try {
      console.log('Starting createTeam with userId:', userId, 'and DTO:', createTeamDto);

      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) throw new NotFoundException('User not found');
      console.log('User found:', user);

      const { members, ...teamData } = createTeamDto;
      console.log('Team data extracted:', teamData);

      // Tạo và lưu team
      const team = this.teamRepository.create({
        ...teamData,
        createdBy: user,
        createdById: user.id,
        createdAt: new Date(),
      });
      console.log('Team entity created:', team);

      const savedTeam = await this.teamRepository.save(team);
      console.log('Team saved to database:', savedTeam);

      // Tạo TeamMember cho user tạo team (vai trò manager)
      const teamMember = this.teamMemberRepository.create({
        team: savedTeam,
        teamId: savedTeam.id,
        user: user,
        userId: user.id,
        role: 'manager',
      });
      console.log('TeamMember entity created for manager:', teamMember);

      await this.teamMemberRepository.save(teamMember);
      console.log('TeamMember saved to database');

      // Thêm các thành viên khác nếu có
      if (members && members.length > 0) {
        console.log('Processing additional members:', members);
        for (const memberDto of members) {
          const memberUser = await this.userRepository.findOne({
            where: { id: memberDto.userId },
          });
          if (!memberUser) throw new NotFoundException(`User with ID ${memberDto.userId} not found`);
          console.log('Member user found:', memberUser);

          const teamMember = this.teamMemberRepository.create({
            team: savedTeam,
            teamId: savedTeam.id,
            user: memberUser,
            userId: memberUser.id,
            role: memberDto.role || 'member',
          });
          console.log('TeamMember entity created for member:', teamMember);

          await this.teamMemberRepository.save(teamMember);
          console.log('TeamMember saved to database for member');
        }
      }

      // Trả về team với đầy đủ quan hệ
      console.log('Fetching team with relations...');
      const result = await this.teamRepository.findOne({
        where: { id: savedTeam.id },
        relations: ['createdBy', 'members', 'members.user'],
      });
      console.log('Team fetched with relations:', result);

      return result!;
    } catch (error) {
      console.error('Error in createTeam:', error.message, error.stack);
      throw new InternalServerErrorException('Failed to create team: ' + error.message);
    }
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
      where: { teamId, userId: user.id },
    });
    if (existingMember) throw new NotFoundException('User already a member of the team');

    const teamMember = this.teamMemberRepository.create({
      team,
      teamId,
      user,
      userId: user.id,
      role: inviteMemberDto.role,
    });
    await this.teamMemberRepository.save(teamMember);

    await this.mailerService.sendMail({
      to: inviteMemberDto.email,
      subject: `You are invited to join the team ${team.name}`,
      text: `Hello,\n\nYou have been invited to join the team ${team.name} with the role of ${inviteMemberDto.role}.\n\nBest regards,\nTeam Management`,
    });
  }

  async getNumberMembers(teamId: number): Promise<number> {
    const numberMember = await this.teamMemberRepository.count({ where: { teamId } });
    if (numberMember === 0) throw new NotFoundException('No members found for this team');
    return numberMember;
  }

  async findAllMembers(teamId: number): Promise<TeamMember[]> {
    return await this.teamMemberRepository.find({
      where: { teamId },
      relations: ['user', 'team'],
    });
  }

  async findAllTeams(): Promise<Team[]> {
    return await this.teamRepository.find({ relations: ['createdBy', 'members', 'members.user'] });
  }

  async findOneTeam(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['createdBy', 'members', 'members.user'],
    });
    if (!team) throw new NotFoundException('Team not found');
    return team!;
  }

  async findOneMember(teamId: number, memberId: number): Promise<TeamMember> {
    const member = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
      relations: ['user', 'team'],
    });
    if (!member) throw new NotFoundException('Member not found in this team');
    return member;
  }

  async updateTeam(teamId: number, updateTeamDto: UpdateTeamDto, userId: number): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['createdBy'],
    });
    if (!team) throw new NotFoundException('Team not found');

    if (team.createdById !== userId) {
      throw new ForbiddenException('You are not allowed to update this team');
    }

    if (updateTeamDto.name) team.name = updateTeamDto.name;
    if (updateTeamDto.description) team.description = updateTeamDto.description;

    const updatedTeam = await this.teamRepository.save(team);

    return updatedTeam;
  }

  async updateMember(teamId: number, memberId: number, updateTeamMemberDto: UpdateTeamMemberDto, userId: number): Promise<TeamMember> {
    const teamMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId: memberId },
      relations: ['team', 'team.createdBy'],
    });
    if (!teamMember) throw new NotFoundException('Member not found');

    const currentUserMember = await this.teamMemberRepository.findOne({
      where: { teamId, userId },
      relations: ['team', 'team.createdBy'],
    });
    if (!currentUserMember || (currentUserMember.role !== 'manager' && teamMember.team.createdById !== userId)) {
      throw new ForbiddenException('You are not allowed to update this team member');
    }

    if (updateTeamMemberDto.role) teamMember.role = updateTeamMemberDto.role;

    const updatedTeamMember = await this.teamMemberRepository.save(teamMember);

    return updatedTeamMember;
  }

  async removeTeam(teamId: number, userId: number): Promise<void> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['createdBy'],
    });
    if (!team) throw new NotFoundException('Team not found');

    if (team.createdById !== userId) {
      throw new ForbiddenException('You are not allowed to remove this team');
    }

    await this.teamMemberRepository.delete({ teamId });
    await this.teamRepository.delete(teamId);
  }

  async removeMember(teamId: number, memberId: number, userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
  
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) throw new NotFoundException('Team not found');
  
    const teamMember = await this.teamMemberRepository.findOne({
      where: { id: memberId, teamId },
      relations: ['user', 'team'],
    });
    if (!teamMember) throw new NotFoundException('Member not found');
  
    if (teamMember.role === 'manager' && userId !== teamMember.userId) {
      throw new ForbiddenException('Only the manager can remove themselves');
    }
  
    const isManager = await this.teamMemberRepository.findOne({
      where: { teamId, userId, role: 'manager' },
    });
    if (!isManager && userId !== teamMember.userId) {
      throw new ForbiddenException('You do not have permission to remove this member');
    }
  
    await this.teamMemberRepository.delete(memberId);
  }
}