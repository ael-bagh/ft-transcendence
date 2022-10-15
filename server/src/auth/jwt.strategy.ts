import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '@/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => (req && req.cookies) ? req.cookies['access_token'] : null
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_TOKEN,
	  passReqToCallback: true
    });
  }

  async validate(req, payload: any) {
	const user = await this.userService.user({ user_id: payload.user_id });
	// console.log("lul", user);
	req.user = user;
	return user;
  }
}