import { Node } from "./graphs_common";

export interface DijkstraStep {
  currentNodeId: string | null; // The node currently being processed (null for initial step)
  distances: Map<string, number>;  // Current distances from the start node
  previous: Map<string, string | null>;   // Previous nodes in the optimal path
  visited: Set<string>;   // Nodes that have been visited
  unvisited: Set<string>; // Nodes that are yet to be visited
  currentShortest: string | null; // Current node with shortest distance in unvisited set
}

export interface DijkstraResult {
  steps: DijkstraStep[];
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  shortestPath: string[] | null; // The shortest path from start to end node
  totalDistance: number | null; // Total distance of the shortest path
}

/**
 * Finds the node with the smallest distance in the unvisited set
 * 
 * @param nodeSet - Set of unvisited node IDs
 * @param distanceMap - Map of distances for each node
 * @returns The node ID with the smallest distance, or null if none found
 */
export function findNodeWithSmallestDistance(
  nodeSet: Set<string>, 
  distanceMap: Map<string, number>
): string | null {
  let minDistance = Infinity;
  let minNodeId: string | null = null;
  
  for (const nodeId of nodeSet) {
    const distance = distanceMap.get(nodeId) || Infinity;
    if (distance < minDistance) {
      minDistance = distance;
      minNodeId = nodeId;
    }
  }
  
  return minNodeId;
}

/**
 * Creates a deep copy of the current algorithm state for step-by-step visualization
 */
export function createDijkstraStep(
  currentId: string | null, 
  nextShortest: string | null,
  distances: Map<string, number>,
  previous: Map<string, string | null>,
  visited: Set<string>,
  unvisited: Set<string>
): DijkstraStep {
  return {
    currentNodeId: currentId,
    distances: new Map(distances),
    previous: new Map(previous),
    visited: new Set(visited),
    unvisited: new Set(unvisited),
    currentShortest: nextShortest
  };
}

/**
 * Initializes the data structures needed for Dijkstra's algorithm
 */
export function initializeDijkstra(
  nodes: Node[], 
  startNodeId: string
): {
  nodeMap: Map<string, Node>,
  distances: Map<string, number>,
  previous: Map<string, string | null>,
  visited: Set<string>,
  unvisited: Set<string>
} {
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();
  
  // Initialize all nodes with infinity distance except the start node
  nodes.forEach(node => {
    distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
    previous.set(node.id, null);
    unvisited.add(node.id);
  });
  
  return { nodeMap, distances, previous, visited, unvisited };
}

/**
 * Reconstructs the shortest path from start to end using the previous node map
 */
export function reconstructPath(
  endNodeId: string,
  previous: Map<string, string | null>,
  distances: Map<string, number>
): { path: string[] | null, distance: number | null } {
  const endNodeDistance = distances.get(endNodeId);
  
  // Check if there is a path to the end node
  if (endNodeDistance !== undefined && endNodeDistance !== Infinity) {
    const path: string[] = [];
    let current: string | null = endNodeId;
    
    // Build the path from end to start, then reverse
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) || null;
    }
    
    return { path, distance: endNodeDistance };
  }
  
  return { path: null, distance: null };
}

/**
 * Implementation of Dijkstra's algorithm to find the shortest path in a weighted graph.
 * The weight of an edge from A to B is determined by the value of node B.
 * 
 * @param nodes - The graph nodes
 * @param startNodeId - The ID of the starting node
 * @param endNodeId - The ID of the destination node (optional)
 * @returns The algorithm steps and result
 */
export function dijkstra(nodes: Node[], startNodeId: string, endNodeId?: string): DijkstraResult {
  // Validate inputs
  if (!nodes.some(node => node.id === startNodeId)) {
    throw new Error(`Start node ${startNodeId} not found in the graph`);
  }
  
  if (endNodeId && !nodes.some(node => node.id === endNodeId)) {
    throw new Error(`End node ${endNodeId} not found in the graph`);
  }
  
  // Initialize data structures
  const { nodeMap, distances, previous, visited, unvisited } = initializeDijkstra(nodes, startNodeId);
  
  // Steps for visualization
  const steps: DijkstraStep[] = [];
  
  // Record initial state
  steps.push(createDijkstraStep(
    null, 
    startNodeId, // The start node will be the first to process
    distances,
    previous,
    visited,
    unvisited
  ));
  
  // Main algorithm loop
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    const currentNodeId = findNodeWithSmallestDistance(unvisited, distances);
    
    // If no reachable node or the smallest distance is infinity,
    // it means there's no path to the remaining nodes
    if (currentNodeId === null || distances.get(currentNodeId) === Infinity) {
      break;
    }
    
    // If we reached the target node, we can record this step before breaking
    if (endNodeId && currentNodeId === endNodeId) {
      // Record this final step before stopping
      steps.push(createDijkstraStep(
        currentNodeId,
        null, // No next node as we're stopping
        distances,
        previous,
        visited,
        unvisited
      ));
      break;
    }
    
    const currentNode = nodeMap.get(currentNodeId)!;
    const currentDistance = distances.get(currentNodeId) || Infinity;
    
    // Mark as visited
    visited.add(currentNodeId);
    unvisited.delete(currentNodeId);
    
    // Update distances to all neighbors
    for (const neighbor of currentNode.neighbors) {
      if (!visited.has(neighbor.id)) {
        // Use the neighbor's value as the edge weight
        const edgeWeight = neighbor.value;
        const tentativeDistance = currentDistance + edgeWeight;
        
        if (tentativeDistance < (distances.get(neighbor.id) || Infinity)) {
          distances.set(neighbor.id, tentativeDistance);
          previous.set(neighbor.id, currentNodeId);
        }
      }
    }
    
    // Find the next node with the smallest distance for visualization
    const nextNodeId = findNodeWithSmallestDistance(unvisited, distances);
    
    // Record this step
    steps.push(createDijkstraStep(
      currentNodeId,
      nextNodeId,
      distances,
      previous,
      visited,
      unvisited
    ));
  }
  
  // Reconstruct the shortest path if an end node was specified
  let shortestPath: string[] | null = null;
  let totalDistance: number | null = null;
  
  if (endNodeId) {
    const pathResult = reconstructPath(endNodeId, previous, distances);
    shortestPath = pathResult.path;
    totalDistance = pathResult.distance;
  }
  
  return {
    steps,
    distances,
    previous,
    shortestPath,
    totalDistance
  };
}