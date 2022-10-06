import { Injectable } from '@nestjs/common';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { authenticator } from 'otplib';
import {User} from '@prisma/client';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
 
@Injectable()
export class TwoFactorAuthenticationService {
  constructor (
    private readonly usersService: UserService,
    private readonly configService: ConfigService
  ) {}
 
  public async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();
 
    const otpauthUrl = authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
 
    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.user_id);
 
    return {
      secret,
      otpauthUrl
    }
  }
  public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
    return toFileStream(stream, otpauthUrl);
  }

  public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
    return authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: user.two_factor_auth
    })
  }
}
