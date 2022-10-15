import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	Put,
	Delete,
	Patch,
	UseGuards,
	Req,
	Res,
	HttpException,
	HttpStatus,
	Query
} from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { User as UserModel, Game as GameModel, Status, prisma, Room, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime';
import { GameService } from '@/game/game.service';
import { profile, timeStamp } from 'console';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { HttpService } from '@nestjs/axios';
import { NOTFOUND } from 'dns';
import { MessageBody } from '@nestjs/websockets';
import { UserModule } from '@/user/user.module';
import { CurrentUser } from '@/user/user.decorator';
import { AchievementService } from './achievement.service';


@Controller('achievement')
@UseGuards(JwtAuthGuard)
export class AchievementController {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly roomService: RoomService,
		private readonly achievementService: AchievementService
	) { }
	
}
