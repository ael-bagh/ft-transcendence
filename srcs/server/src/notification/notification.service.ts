import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/services/prisma.service';
import {Prisma, Notification, Notification_type } from '@prisma/client';

@Injectable()
export class NotificationService {
	constructor(private prisma: PrismaService) { }

	async createNotification(data: Prisma.NotificationCreateInput): Promise<Notification> {
		return this.prisma.notification.create({
			data
		});
	}
	async deleteNotification (id: number) {
		return this.prisma.notification.delete({
			where: {
				notification_id: id
			}
		});
	}

	async deleteNotifications({})
	{
		return this.prisma.notification.deleteMany();
	}


	async findNotification(
		{
			notification_receiver_login: login,
			notification_sender_login: target_login,
			notification_type: Notification_type
		}
	)
	{
		return this.prisma.notification.findFirst({
			where: {
				notification_receiver_login: login,
				notification_sender_login: target_login,
				notification_type: Notification_type
			}
		});
	}
	async addNotification( userData: {
		notification_type: Notification_type,
		notification_date: Date,
		notification_seen: boolean,
		notification_sender_login?: string,
		notification_receiver_login : string,
		notification_payload?: string
	})
	: Promise<Notification> {
		userData['notification_seen'] = false;
		const notif_exists = await this.prisma.notification.findMany({
			where: {
				notification_type: userData.notification_type,
				notification_sender_login: userData.notification_sender_login,
				notification_receiver_login: userData.notification_receiver_login,
			}
		})
		Promise.all(notif_exists.map(async (notif) => {
			await this.deleteNotification(notif.notification_id);
		}));
		const notif = await this.createNotification(userData);
		return notif;
	}

	async getNotifications(login: string): Promise<Notification[]> {
		return await this.prisma.notification.findMany({
			where: {
				notification_receiver_login: login
			},
			orderBy:{
				notification_date: 'desc',
			}
		});
	}

	
	async getNotification(id: number): Promise<Notification> {
		return await this.prisma.notification.findUnique({
			where: {
				notification_id: id
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