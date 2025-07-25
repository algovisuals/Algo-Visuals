export function computeShortestPath(dpValues: number[][]) {
  // Handle empty input case
  if (!dpValues || dpValues.length === 0) {
    throw new Error("Grid cannot be empty");
  }

  const rows = dpValues.length;
  const cols = dpValues[0].length;

  // Initialize distances and previous nodes for the shortest path
  const distances = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(Infinity));
  const previous = Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(null));

  // Set starting point distance to its value
  distances[0][0] = dpValues[0][0];

  // Compute shortest distances using dynamic programming
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (row === 0 && col === 0) continue; // Skip starting point

      let minDistance = Infinity;
      let prevCell: [number, number] | null = null;

      // Check all possible previous cells (up, left)
      if (row > 0) {
        const distance = distances[row - 1][col] + dpValues[row][col];
        if (distance < minDistance) {
          minDistance = distance;
          prevCell = [row - 1, col];
        }
      }

      if (col > 0) {
        const distance = distances[row][col - 1] + dpValues[row][col];
        if (distance < minDistance) {
          minDistance = distance;
          prevCell = [row, col - 1];
        }
      }

      distances[row][col] = minDistance;
      previous[row][col] = prevCell;
    }
  }

  // Reconstruct the shortest path
  const path = [];
  let current: [number, number] | null = [rows - 1, cols - 1]; // End point
  while (current) {
    path.unshift(current);
    if (current[0] === 0 && current[1] === 0) break; // Stop at the start point
    current = previous[current[0]][current[1]];
  }

  return path;
}
