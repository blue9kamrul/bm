export const useVehiclePriceCalculate = () => {
  function getScaleFactor(omv) {
    const m = -0.0001733;
    const b = 1.8867;
    const factor = m * omv + b;
    return Math.max(0.5, Math.min(1.8, factor));
  }
  function calculateVehiclePricePerDay(
    omv,
    condition,
    usageYears,
    securityScore,
    day,
    customScale = 1
  ) {
    const baseRates = {
      1: 0.022,
      2: 0.02,
      3: 0.019,
      4: 0.018,
      5: 0.016,
      6: 0.014,
      7: 0.012,
      8: 0.011,
      9: 0.01,
      10: 0.009,
    };
    const conditionMap = {
      "NEW": 1.0,
      "LIKE_NEW": 0.9,
      "GOOD": 0.75,
      "FAIR": 0.5,
      "POOR": 0.3,
    };
    const securityMap = {
      "VERY_LOW": 1.2,
      "LOW": 1.1,
      "MID": 1.0,
      "HIGH": 0.95,
      "VERY_HIGH": 0.9,
    };
    const usageMultiplier =
      usageYears < 1
        ? 1.0
        : usageYears < 2
          ? 0.85
          : usageYears < 3
            ? 0.7
            : usageYears < 5
              ? 0.55
              : usageYears < 8
                ? 0.4
                : 0.3;

    const baseRate = baseRates[day] || 0.009 - (day - 10) * 0.0001;
    const basePrice = omv * baseRate;
    const scaleFactor = getScaleFactor(omv);
    let finalPrice =
      basePrice *
      conditionMap[condition] *
      usageMultiplier *
      securityMap[securityScore] *
      scaleFactor;

    const floorBase = 1.00375 * Math.sqrt(omv) + 65.02;
    const dayFloorMultiplier = Math.pow(0.97, Math.max(0, day - 1));
    const floorPrice = floorBase * dayFloorMultiplier;
    const ceilBase = 1.6 * Math.sqrt(omv) + 10.87;

    //change this changeRate to give more discount for increasing days
    const changeRate = 0.93;

    const dayCeilMultiplier = Math.pow(changeRate, Math.max(0, day - 1));
    const ceilPrice = ceilBase * dayCeilMultiplier;

    finalPrice = Math.max(finalPrice, floorPrice);
    finalPrice = Math.min(finalPrice, ceilPrice);

    const scaledFinalPrice = finalPrice * parseFloat(customScale);

    return parseFloat(scaledFinalPrice.toFixed(2));
  }
  return { calculateVehiclePricePerDay }
}