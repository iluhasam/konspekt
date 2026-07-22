-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "rawText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'inbox',
    "telegramUserId" TEXT NOT NULL,
    "telegramChatId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Item_telegramUserId_status_idx" ON "Item"("telegramUserId", "status");
