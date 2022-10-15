/*
  Warnings:

  - You are about to drop the column `achievement_image` on the `Achievement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "achievement_image",
ADD COLUMN     "achievement_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
