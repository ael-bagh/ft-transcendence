/*
  Warnings:

  - Added the required column `game_set_id` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Game_mode" AS ENUM ('ONE', 'NORMAL', 'RANKED');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "game_set_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wins" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "Set" (
    "set_id" SERIAL NOT NULL,
    "set_type" "Game_mode" NOT NULL,
    "set_winner_login" TEXT NOT NULL,
    "set_loser_login" TEXT NOT NULL,
    "set_winner_score" INTEGER NOT NULL,
    "set_loser_score" INTEGER NOT NULL,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("set_id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notification_receiver_login_fkey" FOREIGN KEY ("notification_receiver_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notification_sender_login_fkey" FOREIGN KEY ("notification_sender_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_set_winner_login_fkey" FOREIGN KEY ("set_winner_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_set_loser_login_fkey" FOREIGN KEY ("set_loser_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_set_id_fkey" FOREIGN KEY ("game_set_id") REFERENCES "Set"("set_id") ON DELETE RESTRICT ON UPDATE CASCADE;
