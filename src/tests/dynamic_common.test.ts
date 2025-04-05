import { computeShortestPath } from "@/algorithms-core/dynamic_common";

// Helper function for conditional debug logging in tests
function debugLog(debug: boolean, ...args: unknown[]): void {
  if (debug) {
    console.log(...args);
  }
}

// Set to true to enable debug logs in tests
const DEBUG = false;

describe('Dynamic Programming - Shortest Path', () => {
  describe('computeShortestPath', () => {
    test('should find the shortest path in a simple 2x2 grid', () => {
      const grid = [
        [1, 3],
        [2, 1]
      ];
      
      const path = computeShortestPath(grid);
      
      // Expected path coordinates: [0,0] -> [1,0] -> [1,1]
      expect(path).toEqual([[0, 0], [1, 0], [1, 1]]);
    });
    
    test('should find the shortest path in a 3x3 grid', () => {
      const grid = [
        [1, 3, 1],
        [2, 5, 2],
        [4, 2, 1]
      ];
      
      const path = computeShortestPath(grid);
      
      // Verify the path starts at [0,0] and ends at [2,2]
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([2, 2]);
      
      // Verify that the path has the correct length
      // Path should be [0,0] -> [1,0] -> [2,0] -> [2,1] -> [2,2]
      // or an equivalent shortest path
      expect(path.length).toBeGreaterThanOrEqual(5);
      
      // Verify that each step in the path is valid (only moving right or down)
      for (let i = 1; i < path.length; i++) {
        const [prevRow, prevCol] = path[i - 1];
        const [currRow, currCol] = path[i];
        
        const rowDiff = currRow - prevRow;
        const colDiff = currCol - prevCol;
        
        // Each step should move exactly one position right or down
        const isValidStep = (rowDiff === 1 && colDiff === 0) || 
                            (rowDiff === 0 && colDiff === 1);
        
        expect(isValidStep).toBeTruthy();
      }
    });
    
    test('should handle a grid with only one cell', () => {
      const grid = [[5]];
      const path = computeShortestPath(grid);
      
      expect(path).toEqual([[0, 0]]);
    });
    
    test('should handle a grid with only one row', () => {
      const grid = [[1, 2, 3, 4]];
      const path = computeShortestPath(grid);
      
      // Expected path: [0,0] -> [0,1] -> [0,2] -> [0,3]
      expect(path).toEqual([[0, 0], [0, 1], [0, 2], [0, 3]]);
    });
    
    test('should handle a grid with only one column', () => {
      const grid = [
        [1],
        [2],
        [3],
        [4]
      ];
      const path = computeShortestPath(grid);
      
      // Expected path: [0,0] -> [1,0] -> [2,0] -> [3,0]
      expect(path).toEqual([[0, 0], [1, 0], [2, 0], [3, 0]]);
    });
    
    test('should find optimal path in a grid with varying weights', () => {
      const grid = [
        [1, 9, 1],
        [2, 9, 1],
        [1, 1, 1]
      ];
      
      const path = computeShortestPath(grid);
      
      // Debug the computed path
      debugLog(DEBUG, 'Computed path:', path);
      
      // The optimal path should be either:
      // [0,0] -> [1,0] -> [2,0] -> [2,1] -> [2,2]  (total cost = 6)
      // This avoids the high-cost cells (9)
      
      // Calculate the total cost of the path
      let totalCost = 0;
      path.forEach(([row, col]) => {
        totalCost += grid[row][col];
      });
      
      debugLog(DEBUG, 'Total path cost:', totalCost);
      
      // The optimal cost should be 6
      expect(totalCost).toBe(6);
      
      // Verify path starts at [0,0] and ends at [2,2]
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([2, 2]);
    });
    
    test('should throw error for empty grid', () => {
      expect(() => {
        computeShortestPath([]);
      }).toThrow();
    });
    
    test('should find the shortest path in a large grid', () => {
      // Create a 5x5 grid with random values between 1 and 5
      const grid = Array(5).fill(0).map(() => 
        Array(5).fill(0).map(() => Math.floor(Math.random() * 5) + 1)
      );
      
      debugLog(DEBUG, 'Large grid:', grid);
      
      const path = computeShortestPath(grid);
      
      // Verify path starts at [0,0] and ends at [4,4]
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([4, 4]);
      
      // Verify that each step in the path is valid
      for (let i = 1; i < path.length; i++) {
        const [prevRow, prevCol] = path[i - 1];
        const [currRow, currCol] = path[i];
        
        const rowDiff = currRow - prevRow;
        const colDiff = currCol - prevCol;
        
        // Each step should move exactly one position right or down
        const isValidStep = (rowDiff === 1 && colDiff === 0) || 
                            (rowDiff === 0 && colDiff === 1);
        
        expect(isValidStep).toBeTruthy();
      }
      
      // Calculate and verify the total path cost
      let pathCost = 0;
      path.forEach(([row, col]) => {
        pathCost += grid[row][col];
      });
      
      debugLog(DEBUG, 'Path in large grid:', path);
      debugLog(DEBUG, 'Total cost in large grid:', pathCost);
      
      // Manually verify the computed path is actually the shortest
      // by comparing with a naive approach (all right then all down)
      let naivePathCost = 0;
      
      // Go all the way right
      for (let col = 0; col < 5; col++) {
        naivePathCost += grid[0][col];
      }
      
      // Then go all the way down (skip [0,4] as it's already counted)
      for (let row = 1; row < 5; row++) {
        naivePathCost += grid[row][4];
      }
      
      debugLog(DEBUG, 'Naive path cost:', naivePathCost);
      
      // The optimal path should be less than or equal to the naive path
      expect(pathCost).toBeLessThanOrEqual(naivePathCost);
    });
    
    test('debug path reconstruction', () => {
      const grid = [
        [1, 3, 1],
        [2, 8, 1],
        [1, 1, 1]
      ];
      
      debugLog(DEBUG, 'Test grid:', grid);
      
      const path = computeShortestPath(grid);
      
      debugLog(DEBUG, 'Computed path:', path);
      
      // Calculate total cost of the path
      let totalCost = 0;
      path.forEach(([row, col]) => {
        totalCost += grid[row][col];
        debugLog(DEBUG, `Step [${row},${col}] cost: ${grid[row][col]}, running total: ${totalCost}`);
      });
      
      // Check that we got one of the valid optimal paths
      // Either:
      // 1. [0,0] -> [0,1] -> [0,2] -> [1,2] -> [2,2] (cost = 7) or
      // 2. [0,0] -> [1,0] -> [2,0] -> [2,1] -> [2,2] (cost = 6)
      
      // The optimal cost should be 6
      expect(totalCost).toBe(6);
      
      // Verify the path starts at [0,0] and ends at [2,2]
      expect(path[0]).toEqual([0, 0]);
      expect(path[path.length - 1]).toEqual([2, 2]);
    });
  });
});