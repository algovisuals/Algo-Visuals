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
    const array1 = generateRandomArray(20, 1, 100);
    const array2 = generateRandomArray(20, 1, 100);
    
    // There's a very small chance this could fail randomly
    // if both arrays happened to be identical by chance
    expect(array1).not.toEqual(array2);
  });

  test('generates integer values', () => {
    const result = generateRandomArray(20, 1, 100);
    
    result.forEach(num => {
      expect(Number.isInteger(num)).toBe(true);
    });
  });
});