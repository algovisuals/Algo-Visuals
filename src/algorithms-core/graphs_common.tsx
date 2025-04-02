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
 * @description Take in existing graph. All nodes have unique ids and random x and y coordinates, where all nodes can be reached.
 * @param nodes - array of nodes
 * @param maxNeighbors
 * @param minNeighbors
 * @returns void
 */
export function addNeighbors(nodes: Node[], maxNeighbors: number, minNeighbors: number = 1) {
  const nodeCount = nodes.length;
  nodes.forEach((node) => {
    const neighborsCount = Math.max(Math.floor(Math.random() * (maxNeighbors + 1)), minNeighbors);
    const neighbors = new Set<Node>();
    while (neighbors.size < neighborsCount) {
      const randomIndex = Math.floor(Math.random() * nodeCount);
      if (randomIndex !== parseInt(node.id.split("-")[1])) {
        neighbors.add(nodes[randomIndex]);
      }
    }
    node.neighbors = Array.from(neighbors);
  });
}

export function debugGraph(nodes: Node[]) {
  nodes.forEach((node) => {
    console.log(`Node ID: ${node.id}`);
    console.log(`Value: ${node.value}`);
    console.log(`Neighbors: ${node.neighbors.map((n) => n.id).join(", ")}`);
  });
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