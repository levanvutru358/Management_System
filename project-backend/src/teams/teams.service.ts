import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { InviteMemberDto } from './dto/invite-member.dto';

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

  findAll() {
    return `This action returns all teams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} team`;
  }

  update(id: number, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }
}
