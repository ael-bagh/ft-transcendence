/*
  Warnings:

  - You are about to drop the `_user_achievements` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `achievement_user_login` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_user_achievements" DROP CONSTRAINT "_user_achievements_A_fkey";

-- DropForeignKey
ALTER TABLE "_user_achievements" DROP CONSTRAINT "_user_achievements_B_fkey";

-- AlterTable
ALTER TABLE "Achievement" ADD COLUMN     "achievement_user_login" TEXT NOT NULL;

-- DropTable
DROP TABLE "_user_achievements";

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_achievement_user_login_fkey" FOREIGN KEY ("achievement_user_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
