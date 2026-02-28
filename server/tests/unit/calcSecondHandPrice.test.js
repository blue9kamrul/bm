import { calculateSecondHandPrice } from "../../lib/calculateSecondHandPrice";


describe('calculateSecondHandPrice', () => {
  test('should return 7370.37 TK for OMV=8000, LIKE_NEW, usage=1', () => {
    const result = calculateSecondHandPrice(8000, 'LIKE_NEW', 1);
    expect(result).toBeCloseTo(7370.37, 2); // Matches expected output
  });

  test('should return 6997.42 TK for OMV=8000, GOOD, usage=1', () => {
    const result = calculateSecondHandPrice(8000, 'GOOD', 1);
    expect(result).toBeCloseTo(6997.42, 2); // Matches expected output
  });

  test('should return 6619.46 TK for OMV=8000, FAIR, usage=1', () => {
    const result = calculateSecondHandPrice(8000, 'FAIR', 1);
    expect(result).toBeCloseTo(6619.46, 2); // Matches expected output
  });

  // Test additional case for lower OMV
  test('should return ~670 TK for OMV=800, GOOD, usage=0.5', () => {
    const result = calculateSecondHandPrice(800, 'GOOD', 0.5);
    expect(result).toBeCloseTo(671.82, 2); // Adjusted for base=0.97, usage=0.99
  });

  // Test condition variations
  test('should return correct price for OMV=8000, NEW, usage=1', () => {
    const result = calculateSecondHandPrice(8000, 'NEW', 1);
    expect(result).toBeCloseTo(7527.20, 2); // 8000 * 0.97 * 1.0 * 0.97
  });

  test('should return correct price for OMV=8000, POOR, usage=1', () => {
    const result = calculateSecondHandPrice(8000, 'POOR', 1);
    expect(result).toBeCloseTo(5430.40, 2); // 8000 * 0.97 * 0.70 * 0.97
  });

  // Test usage year thresholds
  test('should apply correct usage multiplier for usage < 1 year', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 0.99);
    expect(result).toBeCloseTo(872.99, 2); // 1000 * 0.97 * 0.93 * 0.99
  });

  test('should apply correct usage multiplier for usage 1-2 years', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 1.5);
    expect(result).toBeCloseTo(858.69, 2); // 1000 * 0.97 * 0.93 * 0.97
  });

  test('should apply correct usage multiplier for usage 2-3 years', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 2.5);
    expect(result).toBeCloseTo(827.17, 2); // 1000 * 0.97 * 0.93 * 0.92
  });

  test('should apply correct usage multiplier for usage 3-5 years', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 4);
    expect(result).toBeCloseTo(767.46, 2); // 1000 * 0.97 * 0.93 * 0.85
  });

  test('should apply correct usage multiplier for usage 5-8 years', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 6);
    expect(result).toBeCloseTo(676.04, 2); // 1000 * 0.97 * 0.93 * 0.75
  });

  test('should apply correct usage multiplier for usage >= 8 years', () => {
    const result = calculateSecondHandPrice(1000, 'GOOD', 8);
    expect(result).toBeCloseTo(541.75, 2); // 1000 * 0.97 * 0.93 * 0.60
  });

  // Test edge cases
  test('should return minimum price of 1 TK for OMV=0', () => {
    const result = calculateSecondHandPrice(0, 'GOOD', 1);
    expect(result).toBe(1.0); // Minimum price enforced
  });

  test('should handle very high OMV', () => {
    const result = calculateSecondHandPrice(100000, 'GOOD', 1);
    expect(result).toBeCloseTo(87467.70, 2); // 100000 * 0.97 * 0.93 * 0.97
  });

  // Test input validation
  test('should throw error for negative OMV', () => {
    expect(() => calculateSecondHandPrice(-100, 'GOOD', 1)).toThrow('OMV must be a non-negative number');
  });

  test('should throw error for non-numeric OMV', () => {
    expect(() => calculateSecondHandPrice('invalid', 'GOOD', 1)).toThrow('OMV must be a non-negative number');
  });

  test('should throw error for invalid condition', () => {
    expect(() => calculateSecondHandPrice(1000, 'INVALID', 1)).toThrow('Invalid condition');
  });

  test('should throw error for negative usage years', () => {
    expect(() => calculateSecondHandPrice(1000, 'GOOD', -1)).toThrow('Usage years must be non-negative');
  });

  test('should throw error for non-numeric usage years', () => {
    expect(() => calculateSecondHandPrice(1000, 'GOOD', 'invalid')).toThrow('Usage years must be non-negative');
  });
});