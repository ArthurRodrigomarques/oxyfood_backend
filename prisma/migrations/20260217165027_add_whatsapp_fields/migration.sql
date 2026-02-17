/*
  Warnings:

  - A unique constraint covering the columns `[whatsapp_instance_name]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "bot_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bot_greeting" TEXT,
ADD COLUMN     "whatsapp_instance_name" TEXT,
ADD COLUMN     "whatsapp_status" TEXT NOT NULL DEFAULT 'DISCONNECTED';

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_whatsapp_instance_name_key" ON "restaurants"("whatsapp_instance_name");
