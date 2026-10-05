import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerDto {
  @ApiPropertyOptional({
    example: 'fed400b8-2ac0-49e7-a401-0d3180ae494d',
    description: 'Customer ID',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    example: 'muhammet',
    description: 'Customer first name',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'kuş',
    description: 'Customer last name',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: '05536962054',
    description: 'Customer phone number',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'muhametkus@gmail.com',
    description: 'Customer email address',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'Sdmk inşaat',
    description: 'Customer company / business name',
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({
    example: 'Fevziçakmak mh Postacı sk. No:15 / 5',
    description: 'Customer address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    example: null,
    description: 'Customer notes',
  })
  @IsString()
  @IsOptional()
  notes?: string | null;

  @ApiPropertyOptional({
    example: '2026-10-04T20:49:22.977099Z',
    description: 'Customer creation date',
  })
  @IsDateString()
  @IsOptional()
  createdAt?: string;
}
