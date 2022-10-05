import {
    ClassSerializerInterceptor,
    Controller,
    Header,
    Post,
    UseInterceptors,
    Res,
    UseGuards,
    Req,
    HttpCode,
  } from '@nestjs/common';
  import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
  import { Response } from 'express';
  import {JwtAuthGuard} from '../common/guards/jwt-auth.guard';
  import RequestWithUser from './requestWithUser.interface';
  import { UserService } from '../user/user.service';

   
  @Controller('2fa')
  @UseInterceptors(ClassSerializerInterceptor)
  export class TwoFactorAuthenticationController {
    constructor(
      private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
      private readonly usersService: UserService
    ) {}
   
    @Post('turn-on')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async turnOnTwoFactorAuthentication(
        @Req() request: RequestWithUser,
        @Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationCodeDto
    ) {
        const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthenticationCode, request.user
        );
        if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code');
        }
        await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
    }

    @Post('generate')
    @UseGuards(JwtAuthGuard)
    async register(@Res() response: Response, @Req() request: RequestWithUser) {
      const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);
   
      return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
    }
  }