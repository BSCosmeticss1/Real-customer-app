-- CreateTable
CREATE TABLE "sales_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serialNumber" INTEGER NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerAddress" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "item" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountHistory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sales_reports_userId_date_idx" ON "sales_reports"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "sales_reports_userId_customerName_idx" ON "sales_reports"("userId", "customerName");

-- AddForeignKey
ALTER TABLE "sales_reports" ADD CONSTRAINT "sales_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
