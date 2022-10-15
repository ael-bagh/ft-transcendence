/*
  Warnings:

  - You are about to alter the column `wins` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - Made the column `wins` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "wins" SET NOT NULL,
ALTER COLUMN "wins" SET DEFAULT 0,
ALTER COLUMN "wins" SET DATA TYPE INTEGER;
