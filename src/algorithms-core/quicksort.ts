// Quicksort with step recording.
// Data structure to hold each sorting step.
export interface SortStep {
  arr: number[]; // Current state of the array
  pivotIndex?: number; // The index of the pivot (if applicable)
  comparing?: number[]; // Indices that are currently being compared/highlighted
}

// Swap two elements in an array.
export function swap(arr: number[], i: number, j: number): void {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

// Partition the array and record steps.
export function partition(
  arr: number[],
  left: number,
  right: number,
  steps: SortStep[],
): number {
  // Pick a random pivot index between left and right.
  const randomPivotIndex =
    Math.floor(Math.random() * (right - left + 1)) + left;
  // Swap the random pivot with the rightmost element.
  swap(arr, randomPivotIndex, right);

  const pivot = arr[right];
  let i = left;

  for (let j = left; j < right; j++) {
    // Record a step highlighting the element at index j (being compared against the pivot).
    steps.push({ arr: arr.slice(), pivotIndex: right, comparing: [j] });
    if (arr[j] < pivot) {
      swap(arr, i, j);
      // Record the step after the swap (highlighting both swapped indices).
      steps.push({ arr: arr.slice(), pivotIndex: right, comparing: [i, j] });
      i++;
    }
  }

  // Swap pivot into its correct position.
  swap(arr, i, right);
  // Record the final pivot placement.
  steps.push({ arr: arr.slice(), pivotIndex: i, comparing: [i, right] });

  return i;
}

// Recursively apply quicksort while recording each step.
export function quicksortHelper(
  arr: number[],
  left: number,
  right: number,
  steps: SortStep[],
): void {
  if (left < right) {
    const pivotIndex = partition(arr, left, right, steps);
    quicksortHelper(arr, left, pivotIndex - 1, steps);
    quicksortHelper(arr, pivotIndex + 1, right, steps);
  }
}

// Returns an array of steps detailing the changes during quicksort.
export function getQuickSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arrCopy = initialArray.slice();
  quicksortHelper(arrCopy, 0, arrCopy.length - 1, steps);
  return steps;
}
