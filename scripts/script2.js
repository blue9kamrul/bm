import prisma from "../server/config/prisma.js";

const fillOptimizedImages = async () => {
  const products = await prisma.product.findMany();
  for (const product of products) {
    if (product.productImages && product.productImages.length > 0) {
      const optimized = product.productImages.map(img => 
        img.replace("/uploads/products/", "/uploads/products/optimized/").replace(/\.[^.]+$/, ".webp")
      );
      await prisma.product.update({
        where: { id: product.id },
        data: { optimizedImages: optimized },
      });
      console.log(`Updated product ${product.id}`);
    }
  }
  console.log("All products updated!");
};

fillOptimizedImages();
