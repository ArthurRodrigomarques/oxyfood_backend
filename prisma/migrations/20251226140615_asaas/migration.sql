/*
  Warnings:

  - You are about to drop the column `asaas_customer_id` on the `restaurants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "asaas_customer_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "asaas_customer_id" TEXT,
ADD COLUMN     "cpf" TEXT;
