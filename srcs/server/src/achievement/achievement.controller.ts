import {
	Controller,
	UseGuards,
} from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { GameService } from '@/game/game.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
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
