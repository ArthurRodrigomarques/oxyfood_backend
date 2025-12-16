-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customer_latitude" DECIMAL(10,8),
ADD COLUMN     "customer_longitude" DECIMAL(11,8);

-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "latitude" DECIMAL(10,8),
ADD COLUMN     "longitude" DECIMAL(11,8),
ADD COLUMN     "max_delivery_distance_km" INTEGER NOT NULL DEFAULT 10;
