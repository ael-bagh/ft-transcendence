import { PrismaService } from '@/common/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AchievementService {
	constructor(private prisma: PrismaService) { }

	async getAchievements(login: string) {
		return (this.prisma.achievement.findMany({
			where: {
				achievement_user: {
					login: login
				}
			}
		}
		)
		)
	}
}
