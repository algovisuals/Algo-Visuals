import * as d3 from "d3";
import { FC } from "react";

/**
 * @description Generates a random graph with nodes. All nodes have unique ids and random x and y coordinates, where all nodes can be reached. 
 * @param length 
 * @param min 
 * @param max 
 * @returns 
 */
export function generateRandomGraph(length: number, min: number = 0, max: number = 20): Node[] {
  return Array.from({ length }, (_, i) => ({
    id: `node-${i}`,
    value: Math.floor(Math.random() * (max - min + 1)) + min,
    neighbors: [],
  }));
}



/**
 * @description Add random neighbors to existing graph nodes without replacing existing neighbors
 * @param nodes - array of nodes
 * @param maxNeighbors - maximum new neighbors to add
 * @param minNeighbors - minimum new neighbors to add
 * @returns void
 */
export function addNeighbors(nodes: Node[], maxNeighbors: number, minNeighbors: number = 1) {
  const nodeCount = nodes.length;
  nodes.forEach((node) => {
    // Track existing neighbors to avoid duplicates
    const existingNeighborIds = new Set(node.neighbors.map(n => n.id));
    
    const newNeighborsCount = Math.max(Math.floor(Math.random() * (maxNeighbors + 1)), minNeighbors);
    const newNeighbors = new Set<Node>();
    
    // Try to add the specified number of new neighbors
    let attempts = 0;
    const maxAttempts = nodeCount * 2; // Prevent infinite loop
    
    while (newNeighbors.size < newNeighborsCount && attempts < maxAttempts) {
      attempts++;
      const randomIndex = Math.floor(Math.random() * nodeCount);
      const potentialNeighbor = nodes[randomIndex];
      
      // Skip if trying to add self as neighbor or if already a neighbor
      if (randomIndex !== parseInt(node.id.split("-")[1]) && 
          !existingNeighborIds.has(potentialNeighbor.id) && 
          !newNeighbors.has(potentialNeighbor)) {
        newNeighbors.add(potentialNeighbor);
      }
    }
    
    // Append new neighbors to existing ones
    node.neighbors = [...node.neighbors, ...Array.from(newNeighbors)];
  });
}

export function debugGraph(nodes: Node[]) {
  nodes.forEach((node) => {
    console.log(`Node ID: ${node.id}`);
    console.log(`Value: ${node.value}`);
    console.log(`Neighbors: ${node.neighbors.map((n) => n.id).join(", ")}`);
  });
}

/**
 * @description Creates a connected graph using a randomized spanning tree algorithm
 * @param nodes - array of nodes to be connected
 * @returns void
 */
export function createConnectedGraph(nodes: Node[]) {
  if (nodes.length <= 1) return; // Nothing to connect
  
  // Step 1: Create a randomized spanning tree to ensure connectivity
  const connected = new Set<string>();
  const unconnected = new Set<string>(nodes.map(node => node.id));
  
  // Pick a random starting node
  const startNodeId = nodes[Math.floor(Math.random() * nodes.length)].id;
  connected.add(startNodeId);
  unconnected.delete(startNodeId);
  
  // Create a map for faster node lookup
  const nodeMap = new Map<string, Node>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Connect all nodes randomly
  while (unconnected.size > 0) {
    // Pick a random connected node
    const connectedIds = Array.from(connected);
    const randomConnectedId = connectedIds[Math.floor(Math.random() * connectedIds.length)];
    const connectedNode = nodeMap.get(randomConnectedId)!;
    
    // Pick a random unconnected node
    const unconnectedIds = Array.from(unconnected);
    const randomUnconnectedId = unconnectedIds[Math.floor(Math.random() * unconnectedIds.length)];
    const unconnectedNode = nodeMap.get(randomUnconnectedId)!;
    
    // Connect them
    if(!connectedNode.neighbors.includes(unconnectedNode)) {
      connectedNode.neighbors.push(unconnectedNode);
      unconnectedNode.neighbors.push(connectedNode);
      
      // Move the newly connected node to the connected set
      connected.add(randomUnconnectedId);
      unconnected.delete(randomUnconnectedId);
    }
  }
}

export interface GraphVisualizerProps {
    width: number;
    height: number;
    data: Node[];
}

export interface Node{
  id: string;
  value: number;
  neighbors: Node[];
}

export const GraphVisualizer: FC<GraphVisualizerProps> = ({ width, height, data }) => {
  return <> </>
}