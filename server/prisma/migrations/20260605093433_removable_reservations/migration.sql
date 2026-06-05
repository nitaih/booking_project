-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED';
