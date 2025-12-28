-- AlterEnum
ALTER TYPE "ClientStatus" ADD VALUE 'GHOSTED_FOLLOW_UP';

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "doneContact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eventType" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "nextEventDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "statistically" TEXT;
