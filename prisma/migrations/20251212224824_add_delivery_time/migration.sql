-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "delivery_time_max" INTEGER NOT NULL DEFAULT 45,
ADD COLUMN     "delivery_time_min" INTEGER NOT NULL DEFAULT 30;
