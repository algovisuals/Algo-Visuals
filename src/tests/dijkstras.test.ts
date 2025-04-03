import { Graph, Node, Edge } from "@/algorithms-core/graphs_common";
import {
  dijkstra,
  findNodeWithSmallestDistance,
  createDijkstraStep,
  reconstructPath,
  DijkstraStep,
  DijkstraResult
} from "@/algorithms-core/dijkstras";

describe('Dijkstra Algorithm Utilities', () => {
  describe('findNodeWithSmallestDistance', () => {
    test('should find the node with smallest distance in a set', () => {
      const nodeSet = new Set(['A', 'B', 'C']);
      const distances = new Map([
        ['A', 10],
        ['B', 5],
        ['C', 15]
      ]);
      
      expect(findNodeWithSmallestDistance(nodeSet, distances)).toBe('B');
    });
    
    test('should return null when the node set is empty', () => {
      const nodeSet = new Set<string>();
      const distances = new Map<string, number>();
      
      expect(findNodeWithSmallestDistance(nodeSet, distances)).toBeNull();
    });
    
    test('should handle Infinity distances', () => {
      const nodeSet = new Set(['A', 'B', 'C']);
      const distances = new Map([
        ['A', Infinity],
        ['B', Infinity],
        ['C', 15]
      ]);
      
      expect(findNodeWithSmallestDistance(nodeSet, distances)).toBe('C');
    });
    
    test('debug findNodeWithSmallestDistance function', () => {
      const unvisited = new Set(['A', 'B', 'C', 'D']);
      const distances = new Map([
        ['A', 0],
        ['B', Infinity],
        ['C', Infinity],
        ['D', Infinity]
      ]);
      
      const result = findNodeWithSmallestDistance(unvisited, distances);
      console.log(`Result of findNodeWithSmallestDistance: ${result}`);
      
      // This should be 'A' since it has the smallest distance (0)
      expect(result).toBe('A');
    });
  });
  
  describe('createDijkstraStep', () => {
    test('should create a deep copy of the algorithm state', () => {
      const distances = new Map([['A', 0], ['B', 5]]);
      const previous = new Map([['A', null], ['B', 'A']]);
      const visited = new Set(['A']);
      const unvisited = new Set(['B']);
      
      const step = createDijkstraStep('A', 'B', distances, previous, visited, unvisited);
      
      // Verify step data
      expect(step.currentNodeId).toBe('A');
      expect(step.currentShortest).toBe('B');
      expect(step.distances.get('A')).toBe(0);
      expect(step.distances.get('B')).toBe(5);
      expect(step.previous.get('A')).toBeNull();
      expect(step.previous.get('B')).toBe('A');
      expect(step.visited.has('A')).toBeTruthy();
      expect(step.unvisited.has('B')).toBeTruthy();
      
      // Modify original data structures to verify deep copy
      distances.set('B', 10);
      previous.set('B', 'C');
      visited.add('B');
      unvisited.delete('B');
      
      // Step should maintain original values
      expect(step.distances.get('B')).toBe(5);
      expect(step.previous.get('B')).toBe('A');
      expect(step.visited.has('B')).toBeFalsy();
      expect(step.unvisited.has('B')).toBeTruthy();
    });
  });
  
  describe('reconstructPath', () => {
    test('should reconstruct a valid path from start to end', () => {
      const previous = new Map([
        ['A', null],
        ['B', 'A'],
        ['C', 'B'],
        ['D', 'C']
      ]);
      const distances = new Map([
        ['A', 0],
        ['B', 5],
        ['C', 10],
        ['D', 15]
      ]);
      
      const result = reconstructPath('D', 'A', previous, distances);
      
      expect(result.path).toEqual(['A', 'B', 'C', 'D']);
      expect(result.distance).toBe(15);
    });
    
    test('should return null for unreachable nodes', () => {
      const previous = new Map([
        ['A', null],
        ['B', 'A'],
        ['C', null], // C is disconnected
      ]);
      const distances = new Map([
        ['A', 0],
        ['B', 5],
        ['C', Infinity], // Unreachable
      ]);
      
      const result = reconstructPath('C', 'A', previous, distances);
      
      expect(result.path).toBeNull();
      expect(result.distance).toBeNull();
    });
    
    test('should handle same start and end node', () => {
      const previous = new Map([
        ['A', null],
        ['B', 'A'],
      ]);
      const distances = new Map([
        ['A', 0],
        ['B', 5],
      ]);
      
      const result = reconstructPath('A', 'A', previous, distances);
      
      expect(result.path).toEqual(['A']);
      expect(result.distance).toBe(0);
    });
  });
});

describe('Dijkstra Algorithm', () => {
  // Helper functions for creating test graphs
  function createNode(id: string): Node {
    return {
      id,
      value: 0, // or other default value
      outgoing_edges: null,
      incoming_edges: null
    };
  }

  // Create a simple test graph
  function createTestGraph(): Graph {
    const graph = new Graph();
    
    // Create and add nodes to the graph
    graph.add_node("A", 0);
    graph.add_node("B", 0);
    graph.add_node("C", 0);
    graph.add_node("D", 0);
    
    // Create edges using Graph's add_edge method
    graph.add_edge("A", "B", 1);
    graph.add_edge("A", "C", 4);
    graph.add_edge("B", "C", 2);
    graph.add_edge("B", "D", 5);
    graph.add_edge("C", "D", 1);
    
    return graph;
  }
  
  // Create a more complex test graph
  function createComplexGraph(): Graph {
    const graph = new Graph();
    
    // Create and add nodes to the graph
    const nodeIds = ["A", "B", "C", "D", "E", "F"];
    nodeIds.forEach(id => graph.add_node(id, 0));
    
    // Create edges using Graph's add_edge method
    graph.add_edge("A", "B", 2);
    graph.add_edge("A", "C", 4);
    graph.add_edge("B", "C", 1);
    graph.add_edge("B", "D", 7);
    graph.add_edge("C", "E", 3);
    graph.add_edge("D", "F", 1);
    graph.add_edge("E", "D", 2);
    graph.add_edge("E", "F", 5);
    
    return graph;
  }
  
  test('should find correct shortest paths from a source node', () => {
    const graph = createTestGraph();
    const result = dijkstra(graph, "A");
    
    // Check distances
    expect(result.distances.get("A")).toBe(0);
    expect(result.distances.get("B")).toBe(1);
    expect(result.distances.get("C")).toBe(3); // A->B->C (1+2)
    expect(result.distances.get("D")).toBe(4); // A->B->C->D (1+2+1)
    
    // Check previous nodes
    expect(result.previous.get("A")).toBeNull();
    expect(result.previous.get("B")).toBe("A");
    expect(result.previous.get("C")).toBe("B");
    expect(result.previous.get("D")).toBe("C");
    
    // Check steps were recorded
    expect(result.steps.length).toBeGreaterThan(0);
  });
  
  test('should throw an error if the start node does not exist', () => {
    const graph = createTestGraph();
    
    expect(() => {
      dijkstra(graph, "Z"); // Node "Z" doesn't exist
    }).toThrow("Start node Z not found in the graph");
  });
  
  test('should handle a graph with a single node', () => {
    const graph = new Graph();
    const nodeA = createNode("A");
    graph.nodes = { "A": nodeA };
    
    const result = dijkstra(graph, "A");
    
    expect(result.distances.get("A")).toBe(0);
    expect(result.previous.get("A")).toBeNull();
  });
  
  test('should handle unreachable nodes in the graph', () => {
    const graph = new Graph();
    
    // Create and add nodes to the graph
    graph.add_node("A", 0);
    graph.add_node("B", 0);
    graph.add_node("C", 0);
    
    // Only connect A to B
    graph.add_edge("A", "B", 1);
    
    const result = dijkstra(graph, "A");
    
    // C should be unreachable
    expect(result.distances.get("A")).toBe(0);
    expect(result.distances.get("B")).toBe(1);
    expect(result.distances.get("C")).toBe(Infinity);
    
    expect(result.previous.get("A")).toBeNull();
    expect(result.previous.get("B")).toBe("A");
    expect(result.previous.get("C")).toBeNull();
  });
  
  test('should handle a more complex graph with multiple paths', () => {
    const graph = createComplexGraph();
    const result = dijkstra(graph, "A");
    
    // Expected shortest paths:
    // A -> A: 0
    // A -> B: 2
    // A -> C: 3 (A->B->C)
    // A -> D: 8 (A->B->C->E->D)
    // A -> E: 6 (A->B->C->E)
    // A -> F: 9 (A->B->C->E->D->F)
    
    expect(result.distances.get("A")).toBe(0);
    expect(result.distances.get("B")).toBe(2);
    expect(result.distances.get("C")).toBe(3);
    expect(result.distances.get("D")).toBe(8);
    expect(result.distances.get("E")).toBe(6);
    expect(result.distances.get("F")).toBe(9);
  });
  
  test('should correctly record algorithm steps', () => {
    const graph = createTestGraph();
    const result = dijkstra(graph, "A");
    
    // Check initial step
    const initialStep = result.steps[0];
    expect(initialStep.currentNodeId).toBeNull();
    expect(initialStep.currentShortest).toBe("A");
    expect(initialStep.distances.get("A")).toBe(0);
    expect(Array.from(initialStep.visited)).toEqual([]);
    expect(Array.from(initialStep.unvisited).sort()).toEqual(["A", "B", "C", "D"].sort());
    
    // Check final step
    const finalStep = result.steps[result.steps.length - 1];
    expect(finalStep.visited.size).toBe(4); // All nodes visited
    expect(finalStep.unvisited.size).toBe(0); // No unvisited nodes
  });
  
  test('should be able to find shortest path using reconstructPath', () => {
    const graph = createTestGraph();
    const startNodeId = "A";
    const endNodeId = "D";
    
    // Run Dijkstra's algorithm
    const result = dijkstra(graph, startNodeId);
    
    // Use reconstructPath to find the shortest path
    const pathResult = reconstructPath(endNodeId, startNodeId, result.previous, result.distances);
    
    // Expected shortest path: A -> B -> C -> D
    expect(pathResult.path).toEqual(["A", "B", "C", "D"]);
    expect(pathResult.distance).toBe(4);
  });
  
  test('debug graph structure', () => {
    const graph = createTestGraph();
    
    // Print out the outgoing edges structure for each node
    for (const nodeId in graph.nodes) {
      const node = graph.nodes[nodeId];
      console.log(`Node ${nodeId} outgoing edges:`);
      
      let edge = node.outgoing_edges;
      let count = 0;
      while (edge !== null) {
        console.log(`  Edge to ${edge.to_node.id} with weight ${edge.data}`);
        edge = edge.next_from;
        count++;
      }
      console.log(`  Total outgoing edges: ${count}`);
    }
    
    // Run dijkstra and print detailed steps
    const result = dijkstra(graph, "A");
    console.log("\nDijkstra steps:");
    result.steps.forEach((step, index) => {
      console.log(`Step ${index}:`);
      console.log(`  Current node: ${step.currentNodeId}`);
      console.log(`  Next shortest: ${step.currentShortest}`);
      console.log(`  Distances: ${[...step.distances.entries()].map(([k,v]) => `${k}:${v}`).join(', ')}`);
      console.log(`  Visited: ${Array.from(step.visited).join(', ')}`);
      console.log(`  Unvisited: ${Array.from(step.unvisited).join(', ')}`);
    });
  });
});
