import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { env } from '../common/env';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: env.jwtSecret,
        });
    }

    // payload = { sub, email, username, iat, exp }
    async validate(payload: any) {
        return { sub: payload.sub, email: payload.email, username: payload.username };
    }
}
