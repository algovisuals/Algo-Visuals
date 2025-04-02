import * as d3 from "d3";
import { FC } from "react";

export function generateRandomGraph(length: number, min: number = 0, max: number = 100): Node[] {
  return Array.from({ length }, (_, i) => ({
    id: `node-${i}`,
    label: `Node ${i}`,
    x: Math.random() * (max - min) + min,
    y: Math.random() * (max - min) + min,
  }));
}

export interface GraphVisualizerProps {
    width: number;
    height: number;
    data: Node[];
}

export interface Node{
  id: string;
  label: string;
  x: number;
  y: number;
}

export const GraphVisualizer: FC<GraphVisualizerProps> = ({ width, height, data }) => {
  return <> </>
}