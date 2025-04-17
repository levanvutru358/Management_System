// src/teams/dto/create-team.dto.ts
import { IsString, IsNotEmpty, MinLength, IsOptional, IsArray } from 'class-validator';
import { CreateTeamMemberDto } from './create-team-member.dto';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  members?: CreateTeamMemberDto[];
}