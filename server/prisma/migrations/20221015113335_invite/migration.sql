/*
  Warnings:

  - The values [GAME_INVIT] on the enum `Notification_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Notification_type_new" AS ENUM ('GAME_INVITE', 'FRIEND_REQUEST', 'NEW_FRIEND');
ALTER TABLE "Notification" ALTER COLUMN "notification_type" TYPE "Notification_type_new" USING ("notification_type"::text::"Notification_type_new");
ALTER TYPE "Notification_type" RENAME TO "Notification_type_old";
ALTER TYPE "Notification_type_new" RENAME TO "Notification_type";
DROP TYPE "Notification_type_old";
COMMIT;
