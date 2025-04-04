import { generateRandomArray } from '@/algorithms-core/arrays_common';
import '@testing-library/jest-dom';

describe('generateRandomArray', () => {
  test('returns an array of the specified length', () => {
    const length = 10;
    const result = generateRandomArray(length, 1, 100);
    expect(result).toHaveLength(length);
  });

  test('all elements are within the specified range', () => {
    const min = 5;
    const max = 20;
    const result = generateRandomArray(50, min, max);
    
    result.forEach(num => {
      expect(num).toBeGreaterThanOrEqual(min);
      expect(num).toBeLessThanOrEqual(max);
    });
  });

  test('returns different arrays on multiple calls', () => {
    // Don't mock Math.random, use the actual implementation
    const array1 = generateRandomArray(1000, 1, 100);
    const array2 = generateRandomArray(1000, 1, 100);

    // With a large enough array size, they should be different
    expect(array1).not.toEqual(array2);

    let hasDifference = false;
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        hasDifference = true;
        break;
      }
    }
    expect(hasDifference).toBe(true);
  });

  test('generates integer values', () => {
    const result = generateRandomArray(20, 1, 100);
    
    result.forEach(num => {
      expect(Number.isInteger(num)).toBe(true);
    });
  });
});