/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."VitalKind" AS ENUM ('WEIGHT', 'BODY_TEMP', 'RESTING_HR', 'BLOOD_GLUCOSE');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "public"."SleepSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "endedAt" TIMESTAMPTZ(3) NOT NULL,
    "totalMin" INTEGER NOT NULL,
    "remMin" INTEGER,
    "deepMin" INTEGER,
    "hrAvg" INTEGER,
    "hrvMs" INTEGER,
    "source" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "SleepSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VitalSample" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "public"."VitalKind" NOT NULL,
    "valueNum" DECIMAL(7,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "VitalSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LabResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "testName" TEXT NOT NULL,
    "valueNum" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "refLow" DECIMAL(10,3),
    "refHigh" DECIMAL(10,3),
    "collectedAt" TIMESTAMPTZ(3) NOT NULL,
    "labSource" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "LabResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SleepSession_userId_startedAt_idx" ON "public"."SleepSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "SleepSession_userId_endedAt_idx" ON "public"."SleepSession"("userId", "endedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SleepSession_userId_startedAt_key" ON "public"."SleepSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "VitalSample_userId_recordedAt_idx" ON "public"."VitalSample"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "VitalSample_userId_kind_recordedAt_idx" ON "public"."VitalSample"("userId", "kind", "recordedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VitalSample_userId_kind_recordedAt_key" ON "public"."VitalSample"("userId", "kind", "recordedAt");

-- CreateIndex
CREATE INDEX "LabResult_userId_collectedAt_idx" ON "public"."LabResult"("userId", "collectedAt");

-- CreateIndex
CREATE INDEX "LabResult_userId_testName_collectedAt_idx" ON "public"."LabResult"("userId", "testName", "collectedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabResult_userId_testName_collectedAt_key" ON "public"."LabResult"("userId", "testName", "collectedAt");

-- AddForeignKey
ALTER TABLE "public"."SleepSession" ADD CONSTRAINT "SleepSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VitalSample" ADD CONSTRAINT "VitalSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LabResult" ADD CONSTRAINT "LabResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
