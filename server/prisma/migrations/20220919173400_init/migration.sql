/*
  Warnings:

  - You are about to drop the column `message_chat_id` on the `Message` table. All the data in the column will be lost.
  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chat_creation_date` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `chat_creator_id` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `chat_id` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `chat_name` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `chat_password` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `chat_private` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the `_chat_admins` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_chat_banned_users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_chat_user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `message_room_id` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_creation_date` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_creator_id` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_name` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `room_private` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_message_chat_id_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_chat_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "_chat_admins" DROP CONSTRAINT "_chat_admins_A_fkey";

-- DropForeignKey
ALTER TABLE "_chat_admins" DROP CONSTRAINT "_chat_admins_B_fkey";

-- DropForeignKey
ALTER TABLE "_chat_banned_users" DROP CONSTRAINT "_chat_banned_users_A_fkey";

-- DropForeignKey
ALTER TABLE "_chat_banned_users" DROP CONSTRAINT "_chat_banned_users_B_fkey";

-- DropForeignKey
ALTER TABLE "_chat_user" DROP CONSTRAINT "_chat_user_A_fkey";

-- DropForeignKey
ALTER TABLE "_chat_user" DROP CONSTRAINT "_chat_user_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "message_chat_id",
ADD COLUMN     "message_room_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" DROP CONSTRAINT "Room_pkey",
DROP COLUMN "chat_creation_date",
DROP COLUMN "chat_creator_id",
DROP COLUMN "chat_id",
DROP COLUMN "chat_name",
DROP COLUMN "chat_password",
DROP COLUMN "chat_private",
ADD COLUMN     "room_creation_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "room_creator_id" INTEGER NOT NULL,
ADD COLUMN     "room_id" SERIAL NOT NULL,
ADD COLUMN     "room_name" TEXT NOT NULL,
ADD COLUMN     "room_password" TEXT,
ADD COLUMN     "room_private" BOOLEAN NOT NULL,
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id");

-- DropTable
DROP TABLE "_chat_admins";

-- DropTable
DROP TABLE "_chat_banned_users";

-- DropTable
DROP TABLE "_chat_user";

-- CreateTable
CREATE TABLE "_room_admins" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_room_user" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_room_banned_users" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_room_admins_AB_unique" ON "_room_admins"("A", "B");

-- CreateIndex
CREATE INDEX "_room_admins_B_index" ON "_room_admins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_room_user_AB_unique" ON "_room_user"("A", "B");

-- CreateIndex
CREATE INDEX "_room_user_B_index" ON "_room_user"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_room_banned_users_AB_unique" ON "_room_banned_users"("A", "B");

-- CreateIndex
CREATE INDEX "_room_banned_users_B_index" ON "_room_banned_users"("B");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_room_creator_id_fkey" FOREIGN KEY ("room_creator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_room_id_fkey" FOREIGN KEY ("message_room_id") REFERENCES "Room"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_admins" ADD CONSTRAINT "_room_admins_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_admins" ADD CONSTRAINT "_room_admins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_user" ADD CONSTRAINT "_room_user_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_user" ADD CONSTRAINT "_room_user_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_banned_users" ADD CONSTRAINT "_room_banned_users_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_room_banned_users" ADD CONSTRAINT "_room_banned_users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
