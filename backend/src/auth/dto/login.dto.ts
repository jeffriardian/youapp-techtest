import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'jeffri' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'secret123' })
    @IsString()
    password: string;
}
