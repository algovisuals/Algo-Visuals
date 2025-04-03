import { Node } from "../algorithms-core/graphs_common";
import { 
  dijkstra, 
  findNodeWithSmallestDistance, 
  createDijkstraStep,
  initializeDijkstra,
  reconstructPath
} from "../algorithms-core/dijkstras";

describe('Helper functions', () => {
  // Test findNodeWithSmallestDistance
  describe('findNodeWithSmallestDistance', () => {
    test('returns null for empty set', () => {
      const nodeSet = new Set<string>();
      const distanceMap = new Map<string, number>();
      
      expect(findNodeWithSmallestDistance(nodeSet, distanceMap)).toBeNull();
    });
    
    test('finds node with smallest distance', () => {
      const nodeSet = new Set(['A', 'B', 'C']);
      const distanceMap = new Map([
        ['A', 10],
        ['B', 5],
        ['C', 15]
      ]);
      
      expect(findNodeWithSmallestDistance(nodeSet, distanceMap)).toBe('B');
    });
    
    test('returns first found when multiple nodes have same minimum distance', () => {
      const nodeSet = new Set(['A', 'B', 'C']);
      const distanceMap = new Map([
        ['A', 5],
        ['B', 5],
        ['C', 10]
      ]);
      
      // The implementation checks nodes in order of iteration
      // This test may need adjustment based on implementation specifics
      const result = findNodeWithSmallestDistance(nodeSet, distanceMap);
      expect(result === 'A' || result === 'B').toBeTruthy();
    });
  });
  
  // Test createDijkstraStep
  describe('createDijkstraStep', () => {
    test('creates a deep copy of all data structures', () => {
      const distances = new Map([['A', 0], ['B', 5]]);
      const previous = new Map([['A', null], ['B', 'A']]);
      const visited = new Set(['A']);
      const unvisited = new Set(['B', 'C']);
      
      const step = createDijkstraStep('A', 'B', distances, previous, visited, unvisited);
      
      // Check if the structures are copies, not references
      expect(step.distances).not.toBe(distances);
      expect(step.previous).not.toBe(previous);
      expect(step.visited).not.toBe(visited);
      expect(step.unvisited).not.toBe(unvisited);
      
      // Check if the values are correct
      expect(step.currentNodeId).toBe('A');
      expect(step.currentShortest).toBe('B');
      expect(step.distances.get('A')).toBe(0);
      expect(step.distances.get('B')).toBe(5);
      expect(step.previous.get('B')).toBe('A');
      expect(step.visited.has('A')).toBeTruthy();
      expect(step.unvisited.has('B')).toBeTruthy();
    });
  });
  
  // Test initializeDijkstra
  describe('initializeDijkstra', () => {
    test('initializes data structures correctly', () => {
      const nodes: Node[] = [
        { id: 'A', value: 1, neighbors: [] },
        { id: 'B', value: 2, neighbors: [] },
        { id: 'C', value: 3, neighbors: [] }
      ];
      
      const { nodeMap, distances, previous, visited, unvisited } = initializeDijkstra(nodes, 'A');
      
      // Check nodeMap
      expect(nodeMap.size).toBe(3);
      expect(nodeMap.get('A')).toEqual(nodes[0]);
      
      // Check distances
      expect(distances.get('A')).toBe(0);
      expect(distances.get('B')).toBe(Infinity);
      expect(distances.get('C')).toBe(Infinity);
      
      // Check previous
      expect(previous.get('A')).toBeNull();
      expect(previous.get('B')).toBeNull();
      expect(previous.get('C')).toBeNull();
      
      // Check visited/unvisited
      expect(visited.size).toBe(0);
      expect(unvisited.size).toBe(3);
      expect(unvisited.has('A')).toBeTruthy();
      expect(unvisited.has('B')).toBeTruthy();
      expect(unvisited.has('C')).toBeTruthy();
    });
  });
  
  // Test reconstructPath
  describe('reconstructPath', () => {
    test('returns null when no path exists', () => {
      const previous = new Map<string, string | null>([
        ['A', null],
        ['B', null],
        ['C', null]
      ]);
      const distances = new Map<string, number>([
        ['A', 0],
        ['B', Infinity],
        ['C', Infinity]
      ]);
      
      const result = reconstructPath('C', previous, distances);
      expect(result.path).toBeNull();
      expect(result.distance).toBeNull();
    });
    
    test('reconstructs a simple path correctly', () => {
      const previous = new Map<string, string | null>([
        ['A', null],
        ['B', 'A'],
        ['C', 'B']
      ]);
      const distances = new Map<string, number>([
        ['A', 0],
        ['B', 5],
        ['C', 10]
      ]);
      
      const result = reconstructPath('C', previous, distances);
      expect(result.path).toEqual(['A', 'B', 'C']);
      expect(result.distance).toBe(10);
    });
  });
});

describe('Dijkstra\'s Algorithm', () => {
  // Test main algorithm with a simple graph
  test('finds the shortest path in a simple graph', () => {
    // Create a simple graph:
    // A(1) -> B(2) -> C(3)
    //  ↓        ↓
    //  D(4) -> E(5)
    const nodeC: Node = { id: 'C', value: 3, neighbors: [] };
    const nodeE: Node = { id: 'E', value: 5, neighbors: [] };
    const nodeB: Node = { id: 'B', value: 2, neighbors: [nodeC, nodeE] };
    const nodeD: Node = { id: 'D', value: 4, neighbors: [nodeE] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB, nodeD] };
    
    const nodes = [nodeA, nodeB, nodeC, nodeD, nodeE];
    
    const result = dijkstra(nodes, 'A', 'E');
    
    // Check the shortest path
    expect(result.shortestPath).toEqual(['A', 'B', 'E']);
    expect(result.totalDistance).toBe(7); // A(0) -> B(2) -> E(5) = 7
    
    // Check distances
    expect(result.distances.get('A')).toBe(0);
    expect(result.distances.get('B')).toBe(2);
    expect(result.distances.get('C')).toBe(5);
    expect(result.distances.get('D')).toBe(4);
    expect(result.distances.get('E')).toBe(7);
  });
  
  test('handles disconnected graph correctly', () => {
    // Create a disconnected graph:
    // A(1) -> B(2)    C(3) -> D(4)
    const nodeB: Node = { id: 'B', value: 2, neighbors: [] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB] };
    const nodeD: Node = { id: 'D', value: 4, neighbors: [] };
    const nodeC: Node = { id: 'C', value: 3, neighbors: [nodeD] };
    
    const nodes = [nodeA, nodeB, nodeC, nodeD];
    
    const result = dijkstra(nodes, 'A', 'D');
    
    // There should be no path from A to D
    expect(result.shortestPath).toBeNull();
    expect(result.totalDistance).toBeNull();
    
    // Distances for reachable nodes should be correct
    expect(result.distances.get('A')).toBe(0);
    expect(result.distances.get('B')).toBe(2);
    
    // Distances for unreachable nodes should still be Infinity
    expect(result.distances.get('C')).toBe(Infinity);
    expect(result.distances.get('D')).toBe(Infinity);
  });
  
  test('handles cyclic graphs correctly', () => {
    // Create a graph with a cycle:
    // A(1) -> B(2) -> C(3)
    //  ↑              ↓
    //  └──────────── D(4)
    const nodeD: Node = { id: 'D', value: 4, neighbors: [] };
    const nodeC: Node = { id: 'C', value: 3, neighbors: [nodeD] };
    const nodeB: Node = { id: 'B', value: 2, neighbors: [nodeC] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB] };
    
    // Add the cycle
    nodeD.neighbors = [nodeA];
    
    const nodes = [nodeA, nodeB, nodeC, nodeD];
    
    const result = dijkstra(nodes, 'A', 'D');
    
    // Check shortest path from A to D
    expect(result.shortestPath).toEqual(['A', 'B', 'C', 'D']);
    expect(result.totalDistance).toBe(9); // A(0) -> B(2) -> C(3) -> D(4) = 9
  });
  
  test('throws error for non-existent start node', () => {
    const nodeB: Node = { id: 'B', value: 2, neighbors: [] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB] };
    
    expect(() => {
      dijkstra([nodeA, nodeB], 'X');
    }).toThrow('Start node X not found in the graph');
  });
  
  test('throws error for non-existent end node', () => {
    const nodeB: Node = { id: 'B', value: 2, neighbors: [] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB] };
    
    expect(() => {
      dijkstra([nodeA, nodeB], 'A', 'X');
    }).toThrow('End node X not found in the graph');
  });
  
  test('returns correct number of steps for visualization', () => {
    // Simple linear graph A -> B -> C
    const nodeC: Node = { id: 'C', value: 3, neighbors: [] };
    const nodeB: Node = { id: 'B', value: 2, neighbors: [nodeC] };
    const nodeA: Node = { id: 'A', value: 1, neighbors: [nodeB] };
    
    const nodes = [nodeA, nodeB, nodeC];
    
    const result = dijkstra(nodes, 'A', 'C');
    
    // Initial step + one step for each node processing (A, B, C)
    expect(result.steps.length).toBe(4);
    
    // Check the progress of the algorithm
    expect(result.steps[0].currentNodeId).toBeNull(); // Initial step
    expect(result.steps[1].currentNodeId).toBe('A');
    expect(result.steps[2].currentNodeId).toBe('B');
    expect(result.steps[3].currentNodeId).toBe('C');
  });
});