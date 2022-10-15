-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OFFLINE', 'ONLINE', 'INGAME', 'INQUEUE');

-- CreateEnum
CREATE TYPE "Achievements_name" AS ENUM ('TheAddict', 'WinStreak');

-- CreateEnum
CREATE TYPE "Notification_type" AS ENUM ('GAME_INVIT', 'FRIEND_REQUEST', 'NEW_FRIEND');

-- CreateEnum
CREATE TYPE "Message_type" AS ENUM ('USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "avatar" TEXT,
    "email" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'OFFLINE',
    "two_factor_auth" TEXT,
    "two_factor_auth_enabled" BOOLEAN,
    "creation_date" TIMESTAMP(3),
    "current_lobby" TEXT,
    "is_banned" BOOLEAN,
    "KDA" DECIMAL(65,30),
    "player_level" DOUBLE PRECISION,
    "winrate" DOUBLE PRECISION,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

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
CREATE TABLE "Game" (
    "game_id" TEXT NOT NULL,
    "game_date" TIMESTAMP(3) NOT NULL,
    "game_winner_login" TEXT NOT NULL,
    "game_loser_login" TEXT NOT NULL,
    "game_winner_score" INTEGER,
    "game_loser_score" INTEGER,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("game_id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "achievements_id" SERIAL NOT NULL,
    "achievement_name" "Achievements_name" NOT NULL,
    "achievement_image" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("achievements_id")
);

-- CreateTable
CREATE TABLE "Room" (
    "room_id" SERIAL NOT NULL,
    "room_password" TEXT,
    "room_name" TEXT NOT NULL,
    "room_private" BOOLEAN NOT NULL,
    "room_direct_message" BOOLEAN NOT NULL DEFAULT false,
    "room_creation_date" TIMESTAMP(3) NOT NULL,
    "room_creator_login" TEXT NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" SERIAL NOT NULL,
    "message_content" TEXT NOT NULL,
    "message_time" TIMESTAMP(3) NOT NULL,
    "message_user_login" TEXT,
    "message_room_id" INTEGER NOT NULL,
    "message_type" "Message_type" NOT NULL DEFAULT 'USER',

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "Message_Notification" (
    "notification_id" SERIAL NOT NULL,
    "message_id" INTEGER NOT NULL,
    "user_login" TEXT,
    "room_id" INTEGER NOT NULL,

    CONSTRAINT "Message_Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "_friends" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_friend_request" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_friend_request_sent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_blocked" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_user_achievements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

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
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "_friends_AB_unique" ON "_friends"("A", "B");

-- CreateIndex
CREATE INDEX "_friends_B_index" ON "_friends"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_friend_request_AB_unique" ON "_friend_request"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_request_B_index" ON "_friend_request"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_friend_request_sent_AB_unique" ON "_friend_request_sent"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_request_sent_B_index" ON "_friend_request_sent"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blocked_AB_unique" ON "_blocked"("A", "B");

-- CreateIndex
CREATE INDEX "_blocked_B_index" ON "_blocked"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_user_achievements_AB_unique" ON "_user_achievements"("A", "B");

-- CreateIndex
CREATE INDEX "_user_achievements_B_index" ON "_user_achievements"("B");

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
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_winner_login_fkey" FOREIGN KEY ("game_winner_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_loser_login_fkey" FOREIGN KEY ("game_loser_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_room_creator_login_fkey" FOREIGN KEY ("room_creator_login") REFERENCES "User"("login") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_user_login_fkey" FOREIGN KEY ("message_user_login") REFERENCES "User"("login") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_room_id_fkey" FOREIGN KEY ("message_room_id") REFERENCES "Room"("room_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request" ADD CONSTRAINT "_friend_request_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request" ADD CONSTRAINT "_friend_request_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request_sent" ADD CONSTRAINT "_friend_request_sent_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request_sent" ADD CONSTRAINT "_friend_request_sent_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocked" ADD CONSTRAINT "_blocked_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievements" ADD CONSTRAINT "_user_achievements_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("achievements_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievements" ADD CONSTRAINT "_user_achievements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

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
