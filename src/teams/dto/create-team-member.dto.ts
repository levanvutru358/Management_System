// src/teams/dto/create-team-member.dto.ts
import { IsNumber, IsEnum, IsOptional } from 'class-validator';

export class CreateTeamMemberDto {
  @IsNumber()
  userId: number;

  @IsEnum(['manager', 'member'])
  @IsOptional()
  role?: 'manager' | 'member';
}