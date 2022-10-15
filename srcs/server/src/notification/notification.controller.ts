import {
	Controller,
	Get,
	HttpException,
	UseGuards,
} from '@nestjs/common';

import { UserService } from '@/user/user.service';
import { User as UserModel } from '@prisma/client';
import { GameService } from '@/game/game.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RoomService } from '@/room/room.service';
import { CurrentUser } from '@/user/user.decorator';
import { NotificationService } from './notification.service';


@Controller('')
@UseGuards(JwtAuthGuard)
export class notificationController {
	constructor(
		private readonly userService: UserService,
		private readonly gameService: GameService,
		private readonly roomService: RoomService,
		private readonly notificationService: NotificationService
	) { }

	@Get('notifications')
	async getNotifications(
		@CurrentUser() user: UserModel,
	) {
		try {
			const notifications = await this.notificationService.getNotifications(user.login);
			return notifications;
		}
		catch (e) {
			if (e instanceof HttpException) throw e;
			return [];
		}
	}

	@Get('deleteNotifications')
	async deleteNotifications(
		@CurrentUser() user: UserModel,
	) {
		try {
			await this.notificationService.deleteNotifications({});

		}
		catch (e) {
			if (e instanceof HttpException) throw e;
		}
	}

}