-- CreateEnum
CREATE TYPE "StatusPaket" AS ENUM ('PENDING', 'DIAMBIL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "rumahId" TEXT;

-- CreateTable
CREATE TABLE "Rumah" (
    "id" TEXT NOT NULL,
    "blok" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rumah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warga" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "blokRumah" TEXT NOT NULL,
    "noHp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" TEXT NOT NULL,
    "resi" TEXT,
    "kurir" TEXT NOT NULL,
    "status" "StatusPaket" NOT NULL DEFAULT 'PENDING',
    "penerimaId" TEXT NOT NULL,
    "tanggalMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalDiambil" TIMESTAMP(3),

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rumahId_fkey" FOREIGN KEY ("rumahId") REFERENCES "Rumah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paket" ADD CONSTRAINT "Paket_penerimaId_fkey" FOREIGN KEY ("penerimaId") REFERENCES "Warga"("id") ON DELETE CASCADE ON UPDATE CASCADE;
