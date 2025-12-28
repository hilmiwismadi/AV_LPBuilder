-- CreateEnum
CREATE TYPE "StartupType" AS ENUM ('NOVAGATE', 'NOVATIX');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "startup" "StartupType" NOT NULL DEFAULT 'NOVAGATE';
