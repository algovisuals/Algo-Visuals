import { Graph, Node, Edge } from "./graphs_common";

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
  if (nodeSet.size === 0) return null;
  
  let minDistance = Infinity;
  let minNodeId: string | null = null;
  
  // Debug the node set and distances
  nodeSet.forEach(nodeId => {
    const distance = distanceMap.get(nodeId);
    if (distance !== undefined && distance < minDistance) {
      minDistance = distance;
      minNodeId = nodeId;
    }
  });
  
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
 * Reconstructs the shortest path from start to end using the previous node map
 */
export function reconstructPath(
  endNodeId: string,
  startNodeId: string,
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
      if (current === startNodeId) break; // Stop when we reach the start node
      current = previous.get(current) || null;
    }
    
    // If path doesn't contain start node, it means there's no valid path
    if (path[0] !== startNodeId) {
      return { path: null, distance: null };
    }
    
    return { path, distance: endNodeDistance };
  }
  
  return { path: null, distance: null };
}

/**
 * Implementation of Dijkstra's algorithm to find the shortest paths from a source node to all other nodes.
 * The weight of an edge is determined by the 'data' property of the edge.
 * 
 * @param graph - The graph object containing nodes and edges
 * @param startNodeId - The ID of the starting node
 * @returns The algorithm steps and result
 */
export function dijkstra(graph: Graph, startNodeId: string): DijkstraResult {
  // Validate input
  if (!graph.nodes[startNodeId]) {
    throw new Error(`Start node ${startNodeId} not found in the graph`);
  }
  
  // Initialize data structures
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const unvisited = new Set<string>();
  
  // Initialize all nodes with infinity distance except the start node
  Object.keys(graph.nodes).forEach(nodeId => {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  });
  
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
  
  // For debugging: log the starting distance map
  console.log("Initial distances:", [...distances.entries()].map(([k,v]) => `${k}:${v}`).join(', '));
  
  // Main algorithm loop - continue until all nodes are visited or no more nodes are reachable
  while (unvisited.size > 0) {
    // Find the unvisited node with the smallest distance
    const currentNodeId = findNodeWithSmallestDistance(unvisited, distances);
    
    // If no reachable node, we're done
    if (currentNodeId === null) {
      console.log("No reachable node found, breaking the loop");
      break;
    }
    
    // Get the current distance - this must be from the distances map
    const currentDistance = distances.get(currentNodeId)!;
    
    // For debugging: log the current node and its distance
    console.log(`Processing node ${currentNodeId} with distance ${currentDistance}`);
    
    // If the closest node has infinite distance, no more nodes are reachable
    if (currentDistance === Infinity) {
      console.log("Closest node has infinite distance, breaking the loop");
      break;
    }
    
    // Remove the current node from unvisited and add to visited
    unvisited.delete(currentNodeId);
    visited.add(currentNodeId);
    
    // Get the current node from the graph
    const currentNode = graph.nodes[currentNodeId];
    
    // Process all outgoing edges from the current node to update distances
    let edge = currentNode.outgoing_edges;
    console.log(`Checking outgoing edges from ${currentNodeId}:`);
    
    while (edge !== null) {
      const neighborId = edge.to_node.id;
      
      // Get the weight of the edge (use 1 as default if not a number)
      const weight = typeof edge.data === 'number' ? edge.data : 1;
      const newDistance = currentDistance + weight;
      
      console.log(`  Edge to ${neighborId} with weight ${weight} gives new distance ${newDistance}`);
      console.log(`  Current distance to ${neighborId} is ${distances.get(neighborId)}`);
      
      // If we found a shorter path, update the distance and previous node
      const currentNeighborDistance = distances.has(neighborId) ? distances.get(neighborId)! : Infinity;
      if (newDistance < currentNeighborDistance) {
        console.log(`  Updating distance to ${neighborId} from ${currentNeighborDistance} to ${newDistance}`);
        distances.set(neighborId, newDistance);
        previous.set(neighborId, currentNodeId);
      } else {
        console.log(`  No update needed for ${neighborId}`);
      }
      
      // Move to the next outgoing edge
      edge = edge.next_from;
    }
    
    // Find the next node for visualization
    const nextNodeId = findNodeWithSmallestDistance(unvisited, distances);
    console.log(`Next node to process: ${nextNodeId}`);
    console.log(`Current distances: ${[...distances.entries()].map(([k,v]) => `${k}:${v}`).join(', ')}`);
    console.log(`Visited nodes: ${Array.from(visited).join(', ')}`);
    console.log(`Unvisited nodes: ${Array.from(unvisited).join(', ')}`);
    
    // Record the current step
    steps.push(createDijkstraStep(
      currentNodeId,
      nextNodeId,
      distances,
      previous,
      visited,
      unvisited
    ));
  }
  
  console.log("Algorithm completed");
  console.log(`Final distances: ${[...distances.entries()].map(([k,v]) => `${k}:${v}`).join(', ')}`);
  console.log(`Final previous map: ${[...previous.entries()].map(([k,v]) => `${k}->${v}`).join(', ')}`);
  
  return {
    steps,
    distances,
    previous,
    shortestPath: null,
    totalDistance: null
  };
}
