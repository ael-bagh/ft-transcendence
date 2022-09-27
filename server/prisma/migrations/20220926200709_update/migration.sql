/*
  Warnings:

  - You are about to drop the column `message_user_id` on the `Message` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Notification_type" AS ENUM ('GAME_INVIT', 'FRIEND_REQUEST', 'NEW_FRIEND');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_message_user_id_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "message_user_id",
ADD COLUMN     "message_user_login" TEXT NOT NULL DEFAULT 'lol';

-- CreateTable
CREATE TABLE "Notification" (
    "notification_id" SERIAL NOT NULL,
    "notification_type" "Notification_type" NOT NULL,
    "notification_date" TIMESTAMP(3) NOT NULL,
    "notification_receiver_login" TEXT NOT NULL,
    "notification_sender_login" TEXT NOT NULL,
    "notification_seen" BOOLEAN NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "Message_Notification" (
    "notification_id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "user_login" TEXT NOT NULL,

    CONSTRAINT "Message_Notification_pkey" PRIMARY KEY ("notification_id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_user_login_fkey" FOREIGN KEY ("message_user_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
