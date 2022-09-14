/*
  Warnings:

  - Made the column `game_date` on table `Game` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `chat_creation_date` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Game" ALTER COLUMN "game_date" SET NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "chat_creation_date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "chat_password" DROP NOT NULL;
