import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { User, Game } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@/user/user.service';
import { WsException } from '@nestjs/websockets';

export interface CustomSocket extends Socket {
    user: User;
    token_expire_at: number;
    game_lobby?: Game;
}

export class AuthAdapter extends IoAdapter {
    constructor(app: any,
        private configService: ConfigService,
        private userService: UserService,) {
        super(app);
    }

    createIOServer(port: number, options?: any): Promise<any> {
        const server = super.createIOServer(port, options);
        server.use(async (socket: CustomSocket, next) => {
            const accessTokenHeader = socket.handshake.auth.token as string;
            const accessTokenCookie = socket.handshake.headers.cookie
                ?.split('; ')
                ?.find((cookie: string) => cookie.startsWith('access_token'))
                ?.split('=')[1];
            try {
                console.log('access_token from header:', accessTokenHeader);
                console.log('access_token from cookie:', accessTokenCookie);
                const payload = jwt.verify(accessTokenCookie || accessTokenHeader, this.configService.get('SECRET_TOKEN')) as any;
                console.log(payload);
                const user = await this.userService.user({
                    login: payload.login
                });
                if (!user) next(new WsException('User not found'));
                if (user.is_banned) next(new WsException('User is banned'));
                socket.user = user;
                socket.token_expire_at = payload.exp * 1000;
            } catch (e) {
                console.log(e, "oh no");
                return next(new WsException('Invalid token'));
            }

            return next();
        });
        return server;
    }
}