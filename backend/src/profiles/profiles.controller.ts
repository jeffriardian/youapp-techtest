import { Controller, Get, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { Types } from 'mongoose';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('profiles')
export class ProfilesController {
    constructor(private svc: ProfilesService) {}

    private uid(req: any): Types.ObjectId {
        // req.user diisi oleh JwtStrategy.validate
        return new Types.ObjectId(req.user.sub);
    }

    @Post('createProfile')
    create(@Req() req: any, @Body() dto: CreateProfileDto) {
        return this.svc.create(this.uid(req), dto);
    }

    @Get('getProfile')
    get(@Req() req: any) {
        return this.svc.get(this.uid(req));
    }

    @Patch('updateProfile')
    update(@Req() req: any, @Body() dto: UpdateProfileDto) {
        return this.svc.update(this.uid(req), dto);
    }
}
