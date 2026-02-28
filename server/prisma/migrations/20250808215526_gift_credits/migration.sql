-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_virtual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "virtual_type" TEXT;

-- AlterTable
ALTER TABLE "red_cache_credits" ADD COLUMN     "gift_reason" TEXT,
ADD COLUMN     "gifted_by" TEXT,
ADD COLUMN     "is_gift_credit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validity_date" TIMESTAMP(3);
