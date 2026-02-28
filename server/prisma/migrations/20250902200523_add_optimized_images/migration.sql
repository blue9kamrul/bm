-- AlterTable
ALTER TABLE "products" ADD COLUMN     "optimized_images" TEXT[] DEFAULT ARRAY[]::TEXT[];
