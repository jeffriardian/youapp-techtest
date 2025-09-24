import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hashPassword, comparePassword } from '../common/crypto.util';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<User>,
        private jwt: JwtService,
    ) {}

    async register(dto: RegisterDto) {
        const exists = await this.userModel.findOne({ $or: [{email: dto.email}, {username: dto.username}] });
        if (exists) throw new BadRequestException('Email/username already used');
        const passwordHash = await hashPassword(dto.password);
        const user = await this.userModel.create({ email: dto.email, username: dto.username, passwordHash });
        return { id: user._id, email: user.email, username: user.username };
    }

    async login(dto: LoginDto) {
        const user = await this.userModel.findOne({
        $or: [{ email: dto.username }, { username: dto.username }],
        });
        if (!user) throw new UnauthorizedException('Invalid credentials');
        const ok = await comparePassword(dto.password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Invalid credentials');
        const token = await this.jwt.signAsync({ sub: user._id, email: user.email, username: user.username });
        return { accessToken: token };
    }

    async verify(token: string) {
        return this.jwt.verifyAsync(token);
    }
}
