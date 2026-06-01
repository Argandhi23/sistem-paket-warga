/*
  Warnings:

  - You are about to drop the `Paket` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Warga` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "PackageStatus" ADD VALUE 'EXPIRED';

-- DropForeignKey
ALTER TABLE "Paket" DROP CONSTRAINT "Paket_penerimaId_fkey";

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "penaltyPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickedUpBy" TEXT;

-- DropTable
DROP TABLE "Paket";

-- DropTable
DROP TABLE "Warga";

-- DropEnum
DROP TYPE "StatusPaket";

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
