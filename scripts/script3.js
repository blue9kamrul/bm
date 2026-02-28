import prisma from "../server/config/prisma.js";
import { calculateHourlyPrice } from "./helpers/price-calculations/calculateHourlyPrice.js";
import { calculateGadgetPricePerDay } from "./helpers/price-calculations/gadgetPricePerDay.js";
import { calculateVehiclePricePerDay } from "./helpers/price-calculations/vehiclePricePerDay.js";

const fillOptimizedImages = async () => {
  const products = await prisma.product.findMany({
    include: {
      owner: {
        select: {
          securityScore: true
        }
      }
    }
  });
  for (const product of products) {
    if (product.productType === "GADGET" || product.productType === "VEHICLE") {
      let pricePerHour;
      let pricePerDay;
      if (product.productType === "GADGET") {
        pricePerDay = calculateGadgetPricePerDay(
          parseInt(product.omv),
          product.productCondition,
          parseInt(product.productAge),
          product.owner.securityScore,
          3,
        );
        pricePerHour = calculateHourlyPrice(pricePerDay, 2);
      } else if (product.productType === "VEHICLE") {
        pricePerDay = calculateVehiclePricePerDay(
          parseInt(product.omv),
          product.productCondition,
          parseInt(product.productAge),
          product.owner.securityScore,
          3,
        );
        pricePerHour = calculateHourlyPrice(pricePerDay, 2);
      }
      await prisma.product.update({
        where: { id: product.id },
        data: {
          pricePerDay,
          pricePerHour: (product.productType === "GADGET" || product.productType === "VEHICLE") ? pricePerHour : null,
        },
      });
      console.log(`Updated product ${product.id}`);
    }
  }
  console.log("All products updated!");
};

fillOptimizedImages();
