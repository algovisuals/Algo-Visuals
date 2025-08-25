import { Graph } from "@/algorithms-core/graphs_common";
import {
  dijkstra,
  reconstructPath,
} from "@/algorithms-core/dijkstras";

describe("Dijkstra Hover Path Functionality", () => {
  // Helper function to create a test graph
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

  test("should correctly reconstruct shortest path for hover functionality", () => {
    const graph = createTestGraph();
    const result = dijkstra(graph, "A");

    // Test path to node D
    const pathToD = reconstructPath("D", "A", result.previous, result.distances);
    expect(pathToD.path).toEqual(["A", "B", "C", "D"]);
    expect(pathToD.distance).toBe(4);

    // Test path to node C
    const pathToC = reconstructPath("C", "A", result.previous, result.distances);
    expect(pathToC.path).toEqual(["A", "B", "C"]);
    expect(pathToC.distance).toBe(3);

    // Test path to node B
    const pathToB = reconstructPath("B", "A", result.previous, result.distances);
    expect(pathToB.path).toEqual(["A", "B"]);
    expect(pathToB.distance).toBe(1);

    // Test path to start node
    const pathToA = reconstructPath("A", "A", result.previous, result.distances);
    expect(pathToA.path).toEqual(["A"]);
    expect(pathToA.distance).toBe(0);
  });

  test("should handle unreachable nodes in hover functionality", () => {
    const graph = new Graph();

    // Create isolated components
    graph.add_node("A", 0);
    graph.add_node("B", 0);
    graph.add_node("C", 0);

    // Only connect A to B
    graph.add_edge("A", "B", 1);

    const result = dijkstra(graph, "A");

    // Test path to reachable node
    const pathToB = reconstructPath("B", "A", result.previous, result.distances);
    expect(pathToB.path).toEqual(["A", "B"]);
    expect(pathToB.distance).toBe(1);

    // Test path to unreachable node
    const pathToC = reconstructPath("C", "A", result.previous, result.distances);
    expect(pathToC.path).toBeNull();
    expect(pathToC.distance).toBeNull();
  });

  test("should provide correct final state for hover visualization", () => {
    const graph = createTestGraph();
    const result = dijkstra(graph, "A");

    // Check that final step contains all visited nodes
    const finalStep = result.steps[result.steps.length - 1];
    expect(finalStep.visited.size).toBe(4); // All nodes should be visited
    expect(finalStep.unvisited.size).toBe(0); // No unvisited nodes

    // Check that all distances are finite (graph is connected)
    expect(result.distances.get("A")).toBe(0);
    expect(result.distances.get("B")).toBe(1);
    expect(result.distances.get("C")).toBe(3);
    expect(result.distances.get("D")).toBe(4);

    // Verify none of the distances are Infinity
    result.distances.forEach((distance) => {
      expect(distance).not.toBe(Infinity);
    });
  });

  test("should maintain correct previous node relationships for path reconstruction", () => {
    const graph = createTestGraph();
    const result = dijkstra(graph, "A");

    // Check previous node relationships
    expect(result.previous.get("A")).toBeNull(); // Start node has no previous
    expect(result.previous.get("B")).toBe("A");  // B comes from A
    expect(result.previous.get("C")).toBe("B");  // C comes from B (A->B->C is shorter than A->C)
    expect(result.previous.get("D")).toBe("C");  // D comes from C (A->B->C->D)

    // Verify this gives us the expected shortest paths
    const pathToD = reconstructPath("D", "A", result.previous, result.distances);
    expect(pathToD.path).toEqual(["A", "B", "C", "D"]);
    expect(pathToD.distance).toBe(4); // 1 + 2 + 1 = 4
  });
});