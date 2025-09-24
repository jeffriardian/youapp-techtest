import { IsString, IsOptional, IsDateString, IsNumber, IsArray /*, IsUrl*/ } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProfileDto {
  /*@ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;*/

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiProperty({ example: 'Male', required: false })
  @IsOptional()
  @IsString()
  gender?: 'Male' | 'Female' | 'Other';

  @ApiProperty({ example: '1998-07-21', required: false })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiProperty({ example: 'Leo', required: false })
  @IsOptional()
  @IsString()
  horoscope?: string;

  @ApiProperty({ example: 'Tiger', required: false })
  @IsOptional()
  @IsString()
  zodiac?: string;

  @ApiProperty({ example: 175, required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ example: 65, required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: ['music', 'travel', 'sports'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ example: 'Love coding and exploring new tech.', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  // ⬇️ dulunya @IsUrl(); ganti @IsString supaya path lokal /uploads/xxx juga valid
  @ApiProperty({ example: 'http://localhost:3001/uploads/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
