/*
  Warnings:

  - Added the required column `updatedAt` to the `BioVentingSystemVisit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SveSystemVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BioVentingSystemVisit" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SveSystemVisit" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "BioVentingSystemVisit_updatedAt_idx" ON "BioVentingSystemVisit"("updatedAt");

-- CreateIndex
CREATE INDEX "SveSystemVisit_updatedAt_idx" ON "SveSystemVisit"("updatedAt");
