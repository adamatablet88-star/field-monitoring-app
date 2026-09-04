/*
  Warnings:

  - Added the required column `updatedAt` to the `GroundwaterVisit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GroundwaterVisit" DROP CONSTRAINT "GroundwaterVisit_wellId_fkey";

-- AlterTable
ALTER TABLE "GroundwaterVisit" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "GroundwaterWell" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "z" DOUBLE PRECISION NOT NULL,
    "manholeMaterial" TEXT NOT NULL,
    "manholeSize" TEXT NOT NULL,
    "wellDepth" DOUBLE PRECISION NOT NULL,
    "wellDiameter" DOUBLE PRECISION NOT NULL,
    "screenFrom" DOUBLE PRECISION NOT NULL,
    "screenTo" DOUBLE PRECISION NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "GroundwaterWell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroundwaterWell_siteId_idx" ON "GroundwaterWell"("siteId");

-- CreateIndex
CREATE INDEX "GroundwaterWell_updatedAt_idx" ON "GroundwaterWell"("updatedAt");

-- CreateIndex
CREATE INDEX "GroundwaterVisit_updatedAt_idx" ON "GroundwaterVisit"("updatedAt");

-- AddForeignKey
ALTER TABLE "GroundwaterWell" ADD CONSTRAINT "GroundwaterWell_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundwaterVisit" ADD CONSTRAINT "GroundwaterVisit_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "GroundwaterWell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
