import { IoAdapter } from '@nestjs/platform-socket.io';
// import { verify } from 'jsonwebtoken';
import { Socket } from 'socket.io';
import { User, Game } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { UserService } from './Users_db/user.service';
import { WsException } from '@nestjs/websockets';
import { GameService } from './Games_db/game.service';

export interface CustomSocket extends Socket {
    user: User;
    token_expire_at: number;
    game_lobby?: Game;
}

export class AuthAdapter extends IoAdapter {
    constructor(app: any, private configService: ConfigService, private userService: UserService) {
        super(app);
    }

    createIOServer(port: number, options?: any): Promise<any> {
        const server = super.createIOServer(port, options);
        server.use(async (socket: CustomSocket, next) => {
            const token = socket.handshake.auth.token as string;
            try {
                const payload = jwt.verify(token, this.configService.get('OAUTH_ACCESS_TOKEN_SECRET')) as any;
                const user = await this.userService.user(payload.user_login);
                if (!user) next(new WsException('User not found'));
                if (user.is_banned) next(new WsException('User is banned'));
                socket.user = user;
                socket.token_expire_at = payload.exp * 1000;
            } catch (e) {
                return next(new WsException('Invalid token'));
            }

            return next();
        });
        return server;
    }
}