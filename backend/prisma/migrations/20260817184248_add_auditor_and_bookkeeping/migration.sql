-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'AUDITOR';

-- CreateTable
CREATE TABLE "book_keeping" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "performedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_keeping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_keeping_userId_module_idx" ON "book_keeping"("userId", "module");

-- CreateIndex
CREATE INDEX "book_keeping_userId_createdAt_idx" ON "book_keeping"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "book_keeping_userId_entityType_idx" ON "book_keeping"("userId", "entityType");

-- AddForeignKey
ALTER TABLE "book_keeping" ADD CONSTRAINT "book_keeping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
