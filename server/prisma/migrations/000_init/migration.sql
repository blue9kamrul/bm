-- CreateEnum
CREATE TYPE "VerifyStatus" AS ENUM ('UNVERIFIED', 'VERIFIED', 'PENDING', 'REJECTED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "SecurityScore" AS ENUM ('VERY_LOW', 'LOW', 'MID', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "BccTransactionType" AS ENUM ('RENT_DEPOSIT', 'DEPOSIT_REFUND', 'BONUS_CREDIT', 'PURCHASE_BCC', 'MONEY_WITHDRAWAL', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "BccStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('BKASH', 'NAGAD', 'ROCKET');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BrittoTerminal" AS ENUM ('CSE_1', 'ADMIN_1', 'BANGABANDHU_HALL_1', 'ZIA_HALL_1', 'LIBRARY_1');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('GADGET', 'FURNITURE', 'VEHICLE', 'STATIONARY', 'MUSICAL_INSTRUMENT', 'CLOTHING', 'BOOK', 'ACADEMIC_BOOK', 'ELECTRONICS', 'APARTMENTS', 'OTHERS');

-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "CollectionOrDepositMethod" AS ENUM ('BRITTOO_TERMINAL', 'HOME');

-- CreateEnum
CREATE TYPE "RentalRequestStatus" AS ENUM ('REQUESTED_BY_RENTER', 'CANCELLED_BY_RENTER', 'ACCEPTED_BY_OWNER', 'REJECTED_BY_OWNER', 'REJECTED_FROM_BRITTOO', 'PRODUCT_SUBMITTED_BY_OWNER', 'PRODUCT_COLLECTED_BY_RENTER', 'PRODUCT_RETURNED_BY_RENTER', 'PRODUCT_RETURNED_TO_OWNER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roll" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT,
    "selfie" TEXT,
    "id_card_front" TEXT,
    "id_card_back" TEXT,
    "ip_address" TEXT,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" "VerifyStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "brittoo_verified" BOOLEAN NOT NULL DEFAULT false,
    "otp" TEXT,
    "otp_expiry" TIMESTAMP(3),
    "otp_sent_count" INTEGER NOT NULL DEFAULT 0,
    "last_otp_sent_date" TIMESTAMP(3),
    "security_score" "SecurityScore" NOT NULL DEFAULT 'MID',
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspension_count" INTEGER NOT NULL DEFAULT 0,
    "suspension_reason" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "is_valid_ruet_mail" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuspensionReason" (
    "id" TEXT NOT NULL,

    CONSTRAINT "SuspensionReason_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bcc_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "available_balance" INTEGER NOT NULL DEFAULT 0,
    "locked_balance" INTEGER NOT NULL DEFAULT 0,
    "requested_for_withdrawal" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bcc_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bcc_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "walllet_id" TEXT NOT NULL,
    "rental_request_id" TEXT,
    "amount" INTEGER NOT NULL,
    "payment_gateway" "PaymentGateway",
    "transaction_id" TEXT,
    "number_used_in_trx" TEXT,
    "transaction_type" "BccTransactionType" NOT NULL,
    "status" "BccStatus" DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bcc_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "bcc_transaction_id" TEXT,
    "withdraw_amount" INTEGER NOT NULL,
    "payment_gateway" "PaymentGateway" NOT NULL,
    "phone_number" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "red_cache_credits" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "in_use" INTEGER NOT NULL DEFAULT 0,
    "renter_id" TEXT,
    "user_id" TEXT NOT NULL,
    "source_product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "red_cache_credits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "product_sl_no" SERIAL NOT NULL,
    "product_sl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_per_day" DECIMAL(65,30),
    "product_images" TEXT[],
    "product_type" "ProductType" NOT NULL,
    "product_condition" "ProductCondition" NOT NULL,
    "product_age" INTEGER NOT NULL,
    "omv" INTEGER NOT NULL,
    "second_hand_price" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "owner_id" TEXT NOT NULL,
    "is_on_hold" BOOLEAN NOT NULL DEFAULT false,
    "hold_start_date" TIMESTAMP(3),
    "hold_end_date" TIMESTAMP(3),
    "is_for_sale" BOOLEAN NOT NULL,
    "is_rented" BOOLEAN NOT NULL DEFAULT false,
    "is_brittoo_verified" BOOLEAN NOT NULL DEFAULT false,
    "hold_credit_validity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_requests" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "bcc_wallet_id" TEXT,
    "status" "RentalRequestStatus" NOT NULL DEFAULT 'REQUESTED_BY_RENTER',
    "reject_reason" TEXT,
    "brittoo_reject_reason" TEXT,
    "cancel_reason" TEXT,
    "submission_deadline" TIMESTAMP(3),
    "rental_start_date" TIMESTAMP(3) NOT NULL,
    "rental_end_date" TIMESTAMP(3) NOT NULL,
    "total_days" INTEGER NOT NULL,
    "owner_submit_method" "CollectionOrDepositMethod",
    "renter_collection_method" "CollectionOrDepositMethod" NOT NULL,
    "owner_phone_number" TEXT,
    "renter_phone_number" TEXT NOT NULL,
    "renter_delivery_address" TEXT,
    "pickup_terminal" "BrittoTerminal",
    "owner_submit_address" TEXT,
    "owner_submit_terminal" "BrittoTerminal",
    "renter_return_method" "CollectionOrDepositMethod",
    "renter_return_address" TEXT,
    "renter_return_terminal" "BrittoTerminal",
    "owner_return_receive_method" "CollectionOrDepositMethod",
    "owner_return_receive_address" TEXT,
    "owner_return_receive_terminal" "BrittoTerminal",
    "paid_with_rcc" BOOLEAN NOT NULL DEFAULT false,
    "paid_with_bcc" BOOLEAN NOT NULL DEFAULT false,
    "used_bcc_amount" INTEGER,
    "rcc_product_submitted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rental_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rental_request_rcc_usage" (
    "id" TEXT NOT NULL,
    "rental_request_id" TEXT NOT NULL,
    "red_cache_credit_id" TEXT NOT NULL,
    "used_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rental_request_rcc_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProductsBorrowed" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProductsBorrowed_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_roll_key" ON "users"("roll");

-- CreateIndex
CREATE INDEX "users_latitude_longitude_idx" ON "users"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_deleted_at_key" ON "users"("email", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_roll_deleted_at_key" ON "users"("roll", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_deleted_at_key" ON "users"("phone_number", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_user_id_key" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bcc_wallets_user_id_key" ON "bcc_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "withdrawal_requests_bcc_transaction_id_key" ON "withdrawal_requests"("bcc_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "red_cache_credits_source_product_id_key" ON "red_cache_credits"("source_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_sl_key" ON "products"("product_sl");

-- CreateIndex
CREATE UNIQUE INDEX "products_owner_id_product_sl_key" ON "products"("owner_id", "product_sl");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_sl_no_deleted_at_key" ON "products"("product_sl_no", "deleted_at");

-- CreateIndex
CREATE INDEX "rental_requests_owner_id_status_idx" ON "rental_requests"("owner_id", "status");

-- CreateIndex
CREATE INDEX "rental_requests_product_id_status_idx" ON "rental_requests"("product_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "rental_request_rcc_usage_rental_request_id_red_cache_credit_key" ON "rental_request_rcc_usage"("rental_request_id", "red_cache_credit_id");

-- CreateIndex
CREATE INDEX "_ProductsBorrowed_B_index" ON "_ProductsBorrowed"("B");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bcc_wallets" ADD CONSTRAINT "bcc_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bcc_transactions" ADD CONSTRAINT "bcc_transactions_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bcc_transactions" ADD CONSTRAINT "bcc_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bcc_transactions" ADD CONSTRAINT "bcc_transactions_walllet_id_fkey" FOREIGN KEY ("walllet_id") REFERENCES "bcc_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_bcc_transaction_id_fkey" FOREIGN KEY ("bcc_transaction_id") REFERENCES "bcc_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "bcc_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "red_cache_credits" ADD CONSTRAINT "red_cache_credits_source_product_id_fkey" FOREIGN KEY ("source_product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "red_cache_credits" ADD CONSTRAINT "red_cache_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_bcc_wallet_id_fkey" FOREIGN KEY ("bcc_wallet_id") REFERENCES "bcc_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_requests" ADD CONSTRAINT "rental_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_request_rcc_usage" ADD CONSTRAINT "rental_request_rcc_usage_red_cache_credit_id_fkey" FOREIGN KEY ("red_cache_credit_id") REFERENCES "red_cache_credits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rental_request_rcc_usage" ADD CONSTRAINT "rental_request_rcc_usage_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "rental_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsBorrowed" ADD CONSTRAINT "_ProductsBorrowed_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductsBorrowed" ADD CONSTRAINT "_ProductsBorrowed_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

