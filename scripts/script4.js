import prisma from "../server/config/prisma.js";

const GIFT_AMOUNT = 40000;
const OWNER_ID = "cmdfxaltw0000jkp25nslc1p8";
const GIFT_REASON = "Admin mass gift";
const VALIDITY_DAYS = 60;
const DRY_RUN = false;

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, roll: true }
  });

  console.log(`Found ${users.length} users`);

  for (const user of users) {
    if (DRY_RUN) {
      console.log(`[DRY] Would gift ${GIFT_AMOUNT} BDT to user ${user.roll ?? user.id}`);
      continue;
    }

    try {
      await prisma.$transaction(async (tx) => {
        const virtualProduct = await tx.product.create({
          data: {
            productSL: `GIFT-${user.id}-${Date.now()}`,
            name: `Gift Credit - ${GIFT_AMOUNT} BDT`,
            productType: 'OTHERS',
            productCondition: 'NEW',
            productAge: 1,
            omv: GIFT_AMOUNT,
            secondHandPrice: GIFT_AMOUNT,
            tags: 'gift,credit,admin',
            productDescription: `Gift credit of ${GIFT_AMOUNT} BDT`,
            quantity: 1,
            ownerId: OWNER_ID,
            isForSale: false,
            isVirtual: true,
            virtualType: 'GIFT_CREDIT',
            isBrittooVerified: true,
            pricePerDay: 0
          }
        });

        await tx.redCacheCredit.create({
          data: {
            amount: GIFT_AMOUNT,
            inUse: 0,
            userId: user.id,
            sourceProductId: virtualProduct.id,
            isGiftCredit: true,
            validityDate: new Date(Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000),
            giftReason: GIFT_REASON,
            giftedBy: OWNER_ID
          }
        });
      });

      console.log(`✅ Gifted RCC to ${user.roll ?? user.id}`);
    } catch (err) {
      console.error(`❌ Failed for user ${user.roll ?? user.id}:`, err.message);
    }
  }

  await prisma.$disconnect();
  console.log("All done.");
}

main();
