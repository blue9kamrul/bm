-- CreateEnum
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('REQUESTED_BY_BUYER', 'CANCELLED_BY_BUYER', 'ACCEPTED_BY_SELLER', 'REJECTED_BY_SELLER', 'REJECTED_FROM_BRITTOO', 'PRODUCT_SUBMITTED_BY_SELLER', 'PRODUCT_COLLECTED_BY_BUYER');

-- CreateEnum
CREATE TYPE "PurchaseRequestPaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "min_price" INTEGER,
ALTER COLUMN "is_for_sale" SET DEFAULT false;

-- CreateTable
CREATE TABLE "purchase_requests" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'REQUESTED_BY_BUYER',
    "payment_status" "PurchaseRequestPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "seller_reject_reason" TEXT,
    "buyer_cancel_reasong" TEXT,
    "brittoo_reject_reason" TEXT,
    "asking_price" INTEGER NOT NULL,
    "deal_price" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "platform_charge" INTEGER NOT NULL,
    "buyer_collection_method" "CollectionOrDepositMethod" NOT NULL,
    "seller_delivery_method" "CollectionOrDepositMethod",
    "buyer_phone_number" TEXT NOT NULL,
    "seller_phone_number" TEXT NOT NULL,
    "buyer_delivery_address" TEXT,
    "buyer_pickup_terminal" "BrittoTerminal",
    "seller_delivery_address" TEXT,
    "seller_delivery_terminal" "BrittoTerminal",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_requests" ADD CONSTRAINT "purchase_requests_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
