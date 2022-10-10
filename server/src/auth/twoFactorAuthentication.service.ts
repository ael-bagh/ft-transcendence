import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly usersService: UserService, private readonly configService: ConfigService) {}

  public isTwoFactorAuthenticationCodeValid(code: string, secret: string) {
    
    return authenticator.check(code, secret);
  }
}
