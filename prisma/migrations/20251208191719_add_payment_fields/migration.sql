-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "mp_id" TEXT,
ADD COLUMN     "payment_link" TEXT,
ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "mp_access_token" TEXT;
