-- AlterTable
ALTER TABLE "products" ADD COLUMN     "asking_price" INTEGER,
ADD COLUMN     "price_per_hour" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "is_hourly_rental" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price_per_day" INTEGER,
ADD COLUMN     "price_per_hour" INTEGER,
ADD COLUMN     "total_hours" INTEGER;
