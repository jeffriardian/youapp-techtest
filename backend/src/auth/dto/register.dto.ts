import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'jeffri@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'jeffri' })
    @IsString()
    @MinLength(3)
    username: string;

    @ApiProperty({ example: 'secret123' })
    @IsString()
    @MinLength(6)
    password: string;
}
