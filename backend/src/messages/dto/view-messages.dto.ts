import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ViewMessagesDto {
    @ApiProperty({
        description: 'Username atau email lawan chat (bisa juga ObjectId kalau mau)',
        example: 'user456',
    })
    @IsString()
    peer: string;

    // ⚠️ cursor tetep ada di DTO biar BE bisa handle,
    // tapi tanpa dekorator Swagger supaya ga muncul di docs
    @IsOptional()
    cursor?: string;
}
