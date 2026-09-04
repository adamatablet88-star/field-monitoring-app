-- CreateTable
CREATE TABLE "FrequencySetting" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FrequencySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActiveStatus" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ActiveStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegulatoryReport" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RegulatoryReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledSpecialTest" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ScheduledSpecialTest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrequencySetting_updatedAt_idx" ON "FrequencySetting"("updatedAt");

-- CreateIndex
CREATE INDEX "ActiveStatus_updatedAt_idx" ON "ActiveStatus"("updatedAt");

-- CreateIndex
CREATE INDEX "RegulatoryReport_updatedAt_idx" ON "RegulatoryReport"("updatedAt");

-- CreateIndex
CREATE INDEX "ScheduledSpecialTest_updatedAt_idx" ON "ScheduledSpecialTest"("updatedAt");
