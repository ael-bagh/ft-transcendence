/*
  Warnings:

  - You are about to drop the column `room_creator_id` on the `Room` table. All the data in the column will be lost.
  - Added the required column `room_creator_login` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_room_creator_id_fkey";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "room_creator_id",
ADD COLUMN     "room_creator_login" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_room_creator_login_fkey" FOREIGN KEY ("room_creator_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;
