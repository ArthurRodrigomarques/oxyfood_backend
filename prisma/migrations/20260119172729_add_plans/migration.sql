-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('START', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'START',
ADD COLUMN     "planExpiresAt" TIMESTAMP(3);
