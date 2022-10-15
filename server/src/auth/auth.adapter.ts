import { IoAdapter } from '@nestjs/platform-socket.io';
import { Socket } from 'socket.io';
import { User, Game, Status } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserService } from '@/user/user.service';
import { WsException } from '@nestjs/websockets';
import { GameObject } from '@/game/game.object';

export interface CustomSocket extends Socket {
    user: User;
    token_expire_at: number;
    game_lobby?: GameObject;
    user_nb?: number;
    inQueue: boolean;
}

export class AuthAdapter extends IoAdapter {
    constructor(app: any,
        private readonly configService: ConfigService,
        private readonly userService: UserService,) {
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
                const payload = jwt.verify(accessTokenCookie || accessTokenHeader, this.configService.get('SECRET_TOKEN')) as any;
                let user = await this.userService.user({
                    login: payload.login
                });
                if (!user) next(new WsException('User not found'));
                if (user.is_banned) next(new WsException('User is banned'));
				user = await this.userService.updateUser({
					where: { login: user.login },
					data: {
						status: (user.status == Status.OFFLINE ? Status.ONLINE : user.status),
					}
				});
                socket.user = user;
				
				socket.token_expire_at = payload.exp * 1000;
            } catch (e) {
                // console.log(new Date(),"oh no");
                return next(new WsException('Invalid token'));
            }

            return next();
        });
        return server;
    }
}