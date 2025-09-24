import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ViewMessagesDto } from './dto/view-messages.dto';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
    constructor(private svc: MessagesService) {}

    private uid(req: any) {
        return new Types.ObjectId(req.user.sub);
    }

    @Post('sendMessage')
    @ApiOperation({ summary: 'Kirim pesan ke user lain (pakai username/email)' })
    @ApiBody({ type: SendMessageDto })
    @ApiResponse({ status: 201, description: 'Pesan terkirim' })
    send(@Req() req: any, @Body() dto: SendMessageDto) {
        return this.svc.sendByUserIdentifier(this.uid(req), dto.toUser, dto.body);
    }

    @Get('viewMessages')
    @ApiOperation({ summary: 'Ambil list pesan dengan lawan chat (pakai username/email)' })
    @ApiResponse({ status: 200, description: 'Daftar pesan' })
    view(@Req() req: any, @Query() q: ViewMessagesDto) {
        return this.svc.listByUserIdentifier(this.uid(req), q.peer, q.cursor);
    }
}
