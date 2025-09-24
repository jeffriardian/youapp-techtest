import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly service: AuthService) {}

    @Post('register')
    register(@Body() dto: RegisterDto) { return this.service.register(dto); }

    @Post('login')
    login(@Body() dto: LoginDto) { return this.service.login(dto); }
}
