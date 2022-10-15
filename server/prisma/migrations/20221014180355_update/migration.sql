/*
  Warnings:

  - The values [TheAddict,WinStreak] on the enum `Achievements_name` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Achievements_name_new" AS ENUM ('WELCOME', 'FIRST_GAME', 'FIRST_WIN');
ALTER TABLE "Achievement" ALTER COLUMN "achievement_name" TYPE "Achievements_name_new" USING ("achievement_name"::text::"Achievements_name_new");
ALTER TYPE "Achievements_name" RENAME TO "Achievements_name_old";
ALTER TYPE "Achievements_name_new" RENAME TO "Achievements_name";
DROP TYPE "Achievements_name_old";
COMMIT;
