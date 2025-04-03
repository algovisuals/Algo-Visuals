import * as d3 from "d3";
import { FC, useEffect, useRef, useState } from "react";

// Add the missing Node interface definition
export interface Node {
  id: string;
  value: number;
  neighbors: Node[];
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

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


const debugData = generateRandomGraph(5, 1, 10);

export interface NodeHighlight {
  nodeId: string;
  color: string;
}

export interface EdgeHighlight {
  sourceId: string;
  targetId: string;
  color: string;
}

export interface GraphVisualizerProps {
  width: number;
  height: number;
  data: Node[];
  highlightedNodes?: NodeHighlight[];
  highlightedEdges?: EdgeHighlight[];
}

export const GraphVisualizer: FC<GraphVisualizerProps> = ({
  width,
  height,
  data,
  highlightedNodes = [],
  highlightedEdges = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' && window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Initialization: run only when data/dimensions/theme change.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;

    // Build lookup maps from the props for faster access.
    const highlightedNodesMap = new Map<string, string>();
    highlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, hl.color));
    const highlightedEdgesMap = new Map<string, string>();
    highlightedEdges.forEach(hl => {
      highlightedEdgesMap.set(`${hl.sourceId}-${hl.targetId}`, hl.color);
      highlightedEdgesMap.set(`${hl.targetId}-${hl.sourceId}`, hl.color);
    });

    // Theme-based colors
    const bgGradientStart = isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(220, 13%, 95%)';
    const bgGradientEnd = isDarkMode ? 'hsl(220, 13%, 15%)' : 'hsl(220, 13%, 90%)';
    const defaultNodeGradientStart = isDarkMode ? 'hsl(210, 100%, 50%)' : 'hsl(210, 100%, 50%)';
    const defaultNodeGradientEnd = isDarkMode ? 'hsl(210, 100%, 40%)' : 'hsl(210, 100%, 40%)';
    const defaultLinkColor = isDarkMode ? 'hsl(220, 13%, 45%)' : 'hsl(220, 13%, 75%)';
    const textColor = 'white';

    // Add a subtle gradient background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "url(#gradient-bg)")
      .attr("rx", 12)
      .attr("ry", 12);
      
    // Define gradients for modern look
    const defs = svg.append("defs");
    
    // Background gradient
    const bgGradient = defs.append("linearGradient")
      .attr("id", "gradient-bg")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
      
    bgGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", bgGradientStart)
      .attr("stop-opacity", 0.6);
      
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", bgGradientEnd)
      .attr("stop-opacity", 0.4);
      
    // Default node gradient
    const nodeGradient = defs.append("linearGradient")
      .attr("id", "gradient-node")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");
      
    nodeGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", defaultNodeGradientStart);
      
    nodeGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", defaultNodeGradientEnd);
      
    // Create custom gradients for highlighted nodes
    highlightedNodes.forEach(hl => {
      // Create a lighter version of the highlight color for gradient
      const lighterColor = d3.color(hl.color)?.brighter(0.3)?.toString() || hl.color;
      
      const highlightGradient = defs.append("linearGradient")
        .attr("id", `gradient-node-${hl.nodeId}`)
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");
        
      highlightGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", lighterColor);
        
      highlightGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", hl.color);
    });
    
    // Create links array from the neighbors relationships
    interface Link {
      source: Node;
      target: Node;
      id: string; // unique ID for the link
    }
    
    const links: Link[] = [];
    data.forEach(node => {
      node.neighbors.forEach(neighbor => {
        // Only add each link once to avoid duplicates
        if (node.id < neighbor.id) {
          links.push({
            source: node,
            target: neighbor,
            id: `${node.id}-${neighbor.id}` // for highlight lookup
          });
        }
      });
    });
    
    // Create D3 selections with improved styling
    const linkGroup = svg.append("g");
    
    const link = linkGroup
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", d => {
        // Check if this edge is highlighted
        const highlightColor = highlightedEdgesMap.get(d.id);
        return highlightColor || defaultLinkColor;
      })
      .attr("stroke-opacity", d => highlightedEdgesMap.has(d.id) ? 0.8 : 0.5)
      .attr("stroke-width", d => highlightedEdgesMap.has(d.id) ? 2.5 : 1.5)
      .attr("stroke-linecap", "round");
    
    // Add node shadows for depth
    const shadow = defs.append("filter")
      .attr("id", "shadow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    shadow.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 1)
      .attr("stdDeviation", 2)
      .attr("flood-opacity", 0.3)
      .attr("flood-color", isDarkMode ? "hsl(220, 13%, 5%)" : "hsl(220, 13%, 10%)");
    
    // Add glow effect for highlighted nodes
    const glow = defs.append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
      
    glow.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "blur");
      
    glow.append("feComposite")
      .attr("in", "SourceGraphic")
      .attr("in2", "blur")
      .attr("operator", "over");
    
    // Calculate appropriate node radius based on container size and number of nodes
    const nodeRadius = Math.min(
      26, // Max radius
      Math.max(
        18, // Min radius
        Math.min(width, height) / (Math.sqrt(data.length) * 3)
      )
    );
    
    const nodeGroup = svg.append("g");

    const node = nodeGroup
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => 
        highlightedNodesMap.has(d.id)
          ? `url(#gradient-node-${d.id})`
          : "url(#gradient-node)"
      )
      .attr("filter", d => highlightedNodesMap.has(d.id) ? "url(#glow)" : "url(#shadow)")
      .attr("stroke", d => 
        highlightedNodesMap.has(d.id) ? highlightedNodesMap.get(d.id)! : "white"
      )
      .attr("stroke-width", d => highlightedNodesMap.has(d.id) ? 2 : 1.5)
      .attr("stroke-opacity", 0.8)
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    // Calculate appropriate font size based on node radius
    const fontSize = Math.max(10, Math.min(14, nodeRadius * 0.6));
    
    const text = svg.append("g")
      .selectAll("text")
      .data(data)
      .join("text")
      .text(d => d.value.toString())
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", d => highlightedNodesMap.has(d.id) ? "700" : "500")
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("dy", "0.35em");
    
    // Calculate appropriate force parameters based on container size
    const optimalLinkDistance = Math.min(width, height) / Math.max(4, Math.sqrt(data.length));
    const chargeStrength = -Math.min(
      1000, // Increased max strength for better spreading
      Math.max(
        400, // Increased min strength
        Math.min(width, height) / 2
      )
    );
    
    // Set up force simulation with improved forces for better spreading
    const simulation = d3.forceSimulation<Node>(data)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force("link", d3.forceLink<Node, Link>(links)
        .distance(optimalLinkDistance)
        .strength(0.7))
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("collide", d3.forceCollide<Node>().radius(nodeRadius * 1.8).strength(0.95))
      .force("bounds", () => {
        // Dynamic padding based on container size
        const padding = Math.max(nodeRadius * 2, Math.min(width, height) * 0.08);
        
        for (const node of data) {
          // Keep nodes within bounds
          if (node.x! < padding) node.x = padding;
          if (node.x! > width - padding) node.x = width - padding;
          if (node.y! < padding) node.y = padding;
          if (node.y! > height - padding) node.y = height - padding;
        }
      });
    
    // Add interactivity with drag functions
    function dragstarted(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: Node) {
      // Constrain dragging within bounds
      const padding = nodeRadius;
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }
    
    function dragended(event: any, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x || 0)
        .attr("y1", d => d.source.y || 0)
        .attr("x2", d => d.target.x || 0)
        .attr("y2", d => d.target.y || 0);
        
      node
        .attr("cx", d => d.x || 0)
        .attr("cy", d => d.y || 0);
        
      text
        .attr("x", d => d.x || 0)
        .attr("y", d => d.y || 0);
    });
    
    // Cleanup when component unmounts
    return () => {
      simulation.stop();
    };
  }, [data, dimensions, isDarkMode, highlightedNodes, highlightedEdges]);
  
  // Separate effect: update highlights only.
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Recreate lookup maps for highlights
    const highlightedNodesMap = new Map<string, string>();
    highlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, hl.color));
    const highlightedEdgesMap = new Map<string, string>();
    highlightedEdges.forEach(hl => {
      highlightedEdgesMap.set(`${hl.sourceId}-${hl.targetId}`, hl.color);
      highlightedEdgesMap.set(`${hl.targetId}-${hl.sourceId}`, hl.color);
    });

    // Update node selection individually without removing them
    svg.selectAll<SVGCircleElement, Node>("circle")
      .transition().duration(300)
      .attr("fill", (d: Node) => 
        highlightedNodesMap.has(d.id) ? `url(#gradient-node-${d.id})` : "url(#gradient-node)"
      )
      .attr("stroke", (d: Node) => 
        highlightedNodesMap.has(d.id) ? highlightedNodesMap.get(d.id)! : "white"
      );

    // Update links similarly with proper type cast. For example:
    svg.selectAll<SVGLineElement, { id: string }>("line")
      .transition().duration(300)
      .attr("stroke", (d: { id: string }) => {
        const highlightColor = highlightedEdgesMap.get(d.id);
        return highlightColor ? highlightColor : (isDarkMode ? 'hsl(220, 13%, 45%)' : 'hsl(220, 13%, 75%)');
      })
      .attr("stroke-width", (d: { id: string }) => highlightedEdgesMap.has(d.id) ? 2.5 : 1.5);
  }, [highlightedNodes, highlightedEdges, isDarkMode]);

  // Handle responsive sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
      darkModeMediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800"
      style={{ width: '100%', height: '100%' }}
    >
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        className="w-full h-full"
        style={{ display: 'block' }}
      />
    </div>
  );
};
