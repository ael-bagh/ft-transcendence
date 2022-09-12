-- CreateEnum
CREATE TYPE "Status" AS ENUM ('OFFLINE', 'ONLINE', 'INGAME');

-- CreateEnum
CREATE TYPE "Achievements_name" AS ENUM ('TheAddict', 'WinStreak');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "Status" NOT NULL DEFAULT 'OFFLINE',
    "two_factor_auth" TEXT,
    "creation_date" TIMESTAMP(3),
    "current_lobby" TEXT,
    "KDA" DECIMAL(65,30),
    "player_level" DOUBLE PRECISION,
    "winrate" DOUBLE PRECISION,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Game" (
    "game_id" SERIAL NOT NULL,
    "game_date" TIMESTAMP(3),
    "game_winner_id" INTEGER NOT NULL,
    "game_loser_id" INTEGER NOT NULL,
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
    "chat_id" SERIAL NOT NULL,
    "chat_password" TEXT NOT NULL,
    "chat_name" TEXT NOT NULL,
    "chat_private" BOOLEAN NOT NULL,
    "chat_creator_id" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("chat_id")
);

-- CreateTable
CREATE TABLE "Message" (
    "message_id" SERIAL NOT NULL,
    "message_content" TEXT NOT NULL,
    "message_time" TIMESTAMP(3) NOT NULL,
    "message_user_id" INTEGER NOT NULL,
    "message_chat_id" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("message_id")
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
CREATE TABLE "_user_achievements" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_chat_user" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_chat_banned_users" (
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
CREATE UNIQUE INDEX "_user_achievements_AB_unique" ON "_user_achievements"("A", "B");

-- CreateIndex
CREATE INDEX "_user_achievements_B_index" ON "_user_achievements"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_chat_user_AB_unique" ON "_chat_user"("A", "B");

-- CreateIndex
CREATE INDEX "_chat_user_B_index" ON "_chat_user"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_chat_banned_users_AB_unique" ON "_chat_banned_users"("A", "B");

-- CreateIndex
CREATE INDEX "_chat_banned_users_B_index" ON "_chat_banned_users"("B");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_winner_id_fkey" FOREIGN KEY ("game_winner_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_game_loser_id_fkey" FOREIGN KEY ("game_loser_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_chat_creator_id_fkey" FOREIGN KEY ("chat_creator_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_user_id_fkey" FOREIGN KEY ("message_user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_message_chat_id_fkey" FOREIGN KEY ("message_chat_id") REFERENCES "Room"("chat_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friends" ADD CONSTRAINT "_friends_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request" ADD CONSTRAINT "_friend_request_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request" ADD CONSTRAINT "_friend_request_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievements" ADD CONSTRAINT "_user_achievements_A_fkey" FOREIGN KEY ("A") REFERENCES "Achievement"("achievements_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_achievements" ADD CONSTRAINT "_user_achievements_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chat_user" ADD CONSTRAINT "_chat_user_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chat_user" ADD CONSTRAINT "_chat_user_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chat_banned_users" ADD CONSTRAINT "_chat_banned_users_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_chat_banned_users" ADD CONSTRAINT "_chat_banned_users_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
