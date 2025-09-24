import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Profile } from './schemas/profile.schema';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { getHoroscope, getChineseZodiac } from '../common/horoscope-zodiac.util';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ProfilesService {
    constructor(
        @InjectModel('Profile') private profileModel: Model<Profile>,
        private auth: AuthService,
    ) {}

    private userIdFromAuthHeader(authHeader?: string): Types.ObjectId {
        if (!authHeader) throw new UnauthorizedException();
        const token = authHeader.replace('Bearer ', '');
        return new Types.ObjectId((this.auth as any).jwt.decode(token)['sub']);
    }

    private computeHZ(dto: { birthday?: string }) {
        if (!dto.birthday) return {};
        const d = new Date(dto.birthday);
        return { horoscope: getHoroscope(d), zodiac: getChineseZodiac(d) };
    }

    async create(userId: Types.ObjectId, dto: CreateProfileDto) {
        const hz = this.computeHZ(dto);
        //const { userId: _ignore, ...rest } = dto;
        return this.profileModel.create({ userId, ...dto, ...hz });
    }

    async get(userId: Types.ObjectId) {
        const p = await this.profileModel.findOne({ userId });
        if (!p) throw new NotFoundException('Profile not found');
        return p;
    }

    async update(userId: Types.ObjectId, dto: UpdateProfileDto) {
        const hz = this.computeHZ(dto);
        const p = await this.profileModel.findOneAndUpdate({ userId }, { $set: { ...dto, ...hz } }, { new: true, upsert: true });
        return p;
    }
}
