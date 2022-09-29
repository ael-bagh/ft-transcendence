-- CreateEnum
CREATE TYPE "Message_type" AS ENUM ('USER', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_message_user_login_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "message_type" "Message_type" NOT NULL DEFAULT 'USER',
ALTER COLUMN "message_user_login" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message_Notification" ALTER COLUMN "user_login" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_blocked" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_blocked_AB_unique" ON "_blocked"("A", "B");

-- CreateIndex
CREATE INDEX "_blocked_B_index" ON "_blocked"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_user_login_fkey" FOREIGN KEY ("message_user_login") REFERENCES "User"("login") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
