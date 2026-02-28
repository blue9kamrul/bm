export const useHourlyPrice = () => {
  function calculateHourlyPrice(
    pricePerDay,
    totalHours,
  ) {
    const baseRates = {
      1: 1.00,
      2: 0.91,
      3: 0.85,
      4: 0.81,
      5: 0.76,
      6: 0.70,
      7: 0.66,
      8: 0.60,
      9: 0.57,
      10: 0.52,
    };

    const hourlyPrice = pricePerDay * 1 / 4 * (totalHours > 10 ? 0.51 : baseRates[totalHours]);
    return parseFloat(hourlyPrice.toFixed(2));
  }
  return { calculateHourlyPrice }
}