import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import { User, Prisma, Game, Status, Notification, Notification_type } from '@prisma/client';

@Injectable()
export class NotificationService {
	constructor(private prisma: PrismaService) { }

	async createNotification( data: Prisma.NotificationCreateInput): Promise<Notification> {
		return this.prisma.notification.create({
			data
		});
	}

	async addNotification( userData: {
		notification_type: Notification_type,
		notification_date: Date,
		notification_seen: boolean,
		notification_sender_login?: string,
		notification_receiver_login? : string
	})
	: Promise<Notification> {
		userData['notification_seen'] = false;
		const notif = await this.createNotification(userData);
		return notif;
	}

	async getNotifications(login: string): Promise<Notification[]> {
		return this.prisma.notification.findMany({
			where: {
				notification_receiver_login: login
			}
		});
	}

	async turnSeenToUseen(login: string) {
		return this.prisma.notification.updateMany({
			where: {
				notification_receiver_login: login,
				notification_seen: true,
			},
			data: {
				notification_seen: false,
			}
		});
	}
}