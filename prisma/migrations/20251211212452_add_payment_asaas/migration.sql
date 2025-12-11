-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "asaas_customer_id" TEXT,
ADD COLUMN     "cpf_cnpj" TEXT,
ADD COLUMN     "subscription_status" TEXT NOT NULL DEFAULT 'INACTIVE';
