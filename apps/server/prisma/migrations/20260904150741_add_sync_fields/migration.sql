-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'technician');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Site" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "protocolTypes" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Well" (
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
    "recoveryMethod" TEXT NOT NULL,
    "tankId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Well_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tank" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Tank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentSystem" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "systemType" TEXT NOT NULL,
    "systemLabel" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TreatmentSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParameterConfig" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "required" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "criticalDirection" TEXT NOT NULL,
    "criticalValue" DOUBLE PRECISION,
    "criticalMessage" TEXT NOT NULL,

    CONSTRAINT "ParameterConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentWell" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
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
    "wellType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TreatmentWell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelLensVisit" (
    "id" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "FuelLensVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SveSystemVisit" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "visitType" TEXT NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "SveSystemVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BioVentingSystemVisit" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "BioVentingSystemVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroundwaterVisit" (
    "id" TEXT NOT NULL,
    "wellId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "GroundwaterVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Site_updatedAt_idx" ON "Site"("updatedAt");

-- CreateIndex
CREATE INDEX "Well_siteId_idx" ON "Well"("siteId");

-- CreateIndex
CREATE INDEX "Well_updatedAt_idx" ON "Well"("updatedAt");

-- CreateIndex
CREATE INDEX "Tank_updatedAt_idx" ON "Tank"("updatedAt");

-- CreateIndex
CREATE INDEX "TreatmentSystem_siteId_idx" ON "TreatmentSystem"("siteId");

-- CreateIndex
CREATE INDEX "TreatmentSystem_updatedAt_idx" ON "TreatmentSystem"("updatedAt");

-- CreateIndex
CREATE INDEX "ParameterConfig_systemId_idx" ON "ParameterConfig"("systemId");

-- CreateIndex
CREATE INDEX "TreatmentWell_systemId_idx" ON "TreatmentWell"("systemId");

-- CreateIndex
CREATE INDEX "TreatmentWell_updatedAt_idx" ON "TreatmentWell"("updatedAt");

-- CreateIndex
CREATE INDEX "FuelLensVisit_wellId_idx" ON "FuelLensVisit"("wellId");

-- CreateIndex
CREATE INDEX "SveSystemVisit_systemId_idx" ON "SveSystemVisit"("systemId");

-- CreateIndex
CREATE INDEX "BioVentingSystemVisit_systemId_idx" ON "BioVentingSystemVisit"("systemId");

-- CreateIndex
CREATE INDEX "GroundwaterVisit_wellId_idx" ON "GroundwaterVisit"("wellId");

-- AddForeignKey
ALTER TABLE "Site" ADD CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Well" ADD CONSTRAINT "Well_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Well" ADD CONSTRAINT "Well_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tank" ADD CONSTRAINT "Tank_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentSystem" ADD CONSTRAINT "TreatmentSystem_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParameterConfig" ADD CONSTRAINT "ParameterConfig_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "TreatmentSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentWell" ADD CONSTRAINT "TreatmentWell_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "TreatmentSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FuelLensVisit" ADD CONSTRAINT "FuelLensVisit_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "Well"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SveSystemVisit" ADD CONSTRAINT "SveSystemVisit_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "TreatmentSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BioVentingSystemVisit" ADD CONSTRAINT "BioVentingSystemVisit_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "TreatmentSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroundwaterVisit" ADD CONSTRAINT "GroundwaterVisit_wellId_fkey" FOREIGN KEY ("wellId") REFERENCES "TreatmentWell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
