import {
    Res,
    Req,
    Body,
    Post,
    HttpCode,
    UseGuards,
    Controller,
    UseInterceptors,
    UnauthorizedException,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { TwoFactorAuthenticationCodeDto } from './twoFactorAuthenticationCode.dto';
import {JwtAuthGuard} from '../common/guards/jwt-auth.guard';
import RequestWithUser from './requestWithUser.interface';
import { UserService } from '../user/user.service';
import {AuthService} from './auth.service'

@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
  constructor(
    private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
    private readonly usersService: UserService,
    private readonly authenticationService: AuthService
  ) {}

  @Post('authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(
    @Req() request: RequestWithUser,
    @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
  ) {
    const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
 
    // const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.user_id, true);
    // const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.user_id, true);
 
    request.res.setHeader('Set-Cookie', await this.authenticationService.getCookieWithJwtAccessToken(request.user.user_id, true));
 
    return request.user;
  }

  @Post('turn-on')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(
      @Req() request: RequestWithUser,
      @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
  )
  {
      const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
      twoFactorAuthenticationCode, request.user
      );
      if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
      }
      await this.usersService.turnOnTwoFactorAuthentication(request.user.user_id);
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response: Response, @Req() request: RequestWithUser) {
    const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

    return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
  }
}