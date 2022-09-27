/*
  Warnings:

  - Added the required column `room_id` to the `Message_Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message_Notification" ADD COLUMN     "room_id" INTEGER NOT NULL;
