import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(private readonly usersService: UserService, private readonly configService: ConfigService) {}

  public isTwoFactorAuthenticationCodeValid(code: string, secret: string) {
    
    return authenticator.check(code, secret);
  }

  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
    return {
      secret,
      otpauthUrl
    }
  }
}
