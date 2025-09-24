import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
    @ApiProperty({
        description: 'Username atau email penerima',
        example: 'user456',
    })
    @IsString()
    toUser: string;

    @ApiProperty({
        description: 'Isi pesan',
        example: 'Hello, how are you?',
    })
    @IsString()
    body: string;
}
