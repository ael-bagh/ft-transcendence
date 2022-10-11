import {
  Res,
  Body,
  Get,
  Post,
  HttpCode,
  UseGuards,
  Controller,
  UseInterceptors,
  BadRequestException,
  ClassSerializerInterceptor,
  Param,
} from '@nestjs/common';
import { Response } from 'express';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { User as UserModel } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserService } from '@/user/user.service';
import { AuthService } from '@/auth/auth.service';
import { CurrentUser } from '@/user/user.decorator';
import { authenticator } from 'otplib';

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UserService,
    private readonly authenticationService: AuthService,
  ) {}

  @Post('authenticate/:login')
  @HttpCode(200)
  async authenticate(
    @Param('login') login: string,
    @Body('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ) {
	console.log("mamak");
	
    const user = await this.usersService.user({ login: login });
    if (!user) throw new BadRequestException('User with this login does not exist');
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      code,
      user.two_factor_auth,
    );
    if (!isCodeValid) throw new BadRequestException('Wrong authentication code');
    const refreshToken = await this.authenticationService.loginAndGenerateRefreshToken(user);
	console.log('real one', refreshToken);
    const accessToken = await this.authenticationService.regenerateAccessTokenWithRefreshToken(user, refreshToken);
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
	  domain: process.env.DOMAIN,
      path: '/auth/refresh',
    });
    const expireDate = new Date(); // 2 hours
    expireDate.setHours(expireDate.getHours() + 2);
    response.cookie('access_token', accessToken, {
      httpOnly: true,
	  domain: process.env.DOMAIN,
      expires: expireDate, // TODO: DON'T FORGET TO CHECK IF IT WORKS
      path: '/',
    });
    return user;
  }

  // @Get('generate')
  // // @UseGuards(JwtAuthGuard)
  // async register(@Res() response: Response, @CurrentUser() user: UserModel) {
  //   const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
  //   return otpauthUrl

  //   // return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
  // }  

  @Get("generate")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async generateSecret()
  {
	return {secret: authenticator.generateSecret()};
  }

  @Post('enable')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
    @Body() { code, secret }: { code: string; secret: string },
    @CurrentUser() user: UserModel,
  ) {
    console.log(code, secret);
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(code, secret);
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
    await this.usersService.turnTwoFactorAuthentication(user.user_id, true, secret);
    return { message: 'Two factor authentication enabled' };
  }

  @Post('disable')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOffTwoFactorAuthentication(@Body() { code }: { code: string }, @CurrentUser() user: UserModel) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      code,
      user.two_factor_auth,
    );
    if (!isCodeValid) {
      throw new BadRequestException('Wrong authentication code');
    }
   
    await this.usersService.turnTwoFactorAuthentication(user.user_id, false, null);
    return { message: 'Two factor authentication disabled' };
  }
}
