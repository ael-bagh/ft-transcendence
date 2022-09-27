/*
  Warnings:

  - You are about to drop the column `game_loser_id` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `game_winner_id` on the `Game` table. All the data in the column will be lost.
  - Added the required column `game_loser_login` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_winner_login` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_game_loser_id_fkey";

-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_game_winner_id_fkey";

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "game_loser_id",
DROP COLUMN "game_winner_id",
ADD COLUMN     "game_loser_login" TEXT NOT NULL,
ADD COLUMN     "game_winner_login" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_winner_login_fkey" FOREIGN KEY ("game_winner_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_loser_login_fkey" FOREIGN KEY ("game_loser_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
