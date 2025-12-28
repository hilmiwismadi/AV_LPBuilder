-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('TODO', 'FOLLOW_UP', 'NEXT_YEAR');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "eventOrganizer" TEXT NOT NULL,
    "igLink" TEXT,
    "cp1st" TEXT,
    "cp2nd" TEXT,
    "imgLogo" TEXT,
    "imgPoster" TEXT,
    "lastEvent" TEXT,
    "linkDemo" TEXT,
    "lastSystem" TEXT,
    "colorPalette" TEXT,
    "dateEstimation" TIMESTAMP(3),
    "igeventLink" TEXT,
    "lastContact" TIMESTAMP(3),
    "pic" TEXT,
    "status" "ClientStatus" NOT NULL DEFAULT 'TODO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_history" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isOutgoing" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "variables" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_phoneNumber_key" ON "clients"("phoneNumber");

-- CreateIndex
CREATE INDEX "chat_history_clientId_idx" ON "chat_history"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "chat_templates_name_key" ON "chat_templates"("name");

-- AddForeignKey
ALTER TABLE "chat_history" ADD CONSTRAINT "chat_history_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
