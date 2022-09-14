import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Game, Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async game(
    gameWhereUniqueInput: Prisma.GameWhereUniqueInput,
  ): Promise<Game | null> {
    return this.prisma.game.findUnique({
      where: gameWhereUniqueInput,
    });
  }

  

  async games(params: Prisma.GameFindManyArgs): Promise<Game[]> {
    return this.prisma.game.findMany(params);
  }

  async prismaCreateGame(data: Prisma.GameCreateInput): Promise<Game> {
    return this.prisma.game.create({
      data,
    });
  }

  async createGame(
	gameData: { game_winner_id: number; game_loser_id: number ; game_winner_score: number; game_loser_score: number},
  ): Promise<Game> {
	let data: Prisma.GameCreateInput = {game_date: new Date()};
	data['game_date'] = new Date();
	data['game_winner'] = {
		connect: {
				user_id: Number(gameData['game_winner_id'])
		},
	}
	data['game_loser'] = {
		connect: {
				user_id: Number(gameData['game_loser_id'])
		},
	}
	data['game_loser_score'] = Number(gameData['game_loser_score']);
	data['game_winner_score'] = Number(gameData['game_winner_score']);
	return this.prismaCreateGame(data);
  }

  async updateGame(params: {
    where: Prisma.GameWhereUniqueInput;
    data: Prisma.GameUpdateInput;
  }): Promise<Game> {
    const { data, where } = params;
    return this.prisma.game.update({
      data,
      where,
    });
  }

  async deleteGame(where: Prisma.GameWhereUniqueInput): Promise<Game> {
    return this.prisma.game.delete({
      where,
    });
  }
}