-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'OWNER';
