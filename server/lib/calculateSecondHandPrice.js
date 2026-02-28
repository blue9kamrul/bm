export function calculateSecondHandPrice(omv, condition, productAge) {
  if (omv < 0 || !Number.isFinite(omv)) {
    throw new Error("OMV must be a non-negative number");
  }
  if (!["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"].includes(condition)) {
    throw new Error("Invalid condition");
  }
  if (productAge < 0 || !Number.isFinite(productAge)) {
    throw new Error("Usage years must be non-negative");
  }

  const baseDepreciationRate = 0.97;
  const conditionMap = {
    NEW: 1.0,
    LIKE_NEW: 0.98,  // 2% drop
    GOOD: 0.93,      // 7% drop
    FAIR: 0.88,      // 12% drop
    POOR: 0.70       // 30% drop
  };

  const usageMultiplier =
    productAge < 1
      ? 0.99
      : productAge < 2
        ? 0.97
        : productAge < 3
          ? 0.92
          : productAge < 5
            ? 0.85
            : productAge < 8
              ? 0.75
              : 0.60;


  const rawPrice = omv * baseDepreciationRate * conditionMap[condition] * usageMultiplier;

  // floor if decimal < 0.5, else ceil
  const integerPart = Math.floor(rawPrice);
  const decimalPart = rawPrice - integerPart;
  const roundedPrice = decimalPart < 0.5 ? integerPart : Math.ceil(rawPrice);

  return Math.max(1.0, roundedPrice);
}