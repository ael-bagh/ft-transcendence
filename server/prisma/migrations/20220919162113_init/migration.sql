-- CreateTable
CREATE TABLE "_friend_request_sent" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_friend_request_sent_AB_unique" ON "_friend_request_sent"("A", "B");

-- CreateIndex
CREATE INDEX "_friend_request_sent_B_index" ON "_friend_request_sent"("B");

-- AddForeignKey
ALTER TABLE "_friend_request_sent" ADD CONSTRAINT "_friend_request_sent_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_friend_request_sent" ADD CONSTRAINT "_friend_request_sent_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
