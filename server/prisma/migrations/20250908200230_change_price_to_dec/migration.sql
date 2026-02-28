-- AlterTable
ALTER TABLE "rental_requests" ALTER COLUMN "price_per_day" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "price_per_hour" SET DATA TYPE DECIMAL(65,30);
