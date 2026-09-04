/*
  Warnings:

  - Added the required column `updatedAt` to the `FuelLensVisit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FuelLensVisit" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "FuelLensVisit_updatedAt_idx" ON "FuelLensVisit"("updatedAt");
