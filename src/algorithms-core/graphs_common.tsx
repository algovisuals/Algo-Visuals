import * as d3 from "d3";
import { FC, useEffect, useRef, useState } from "react";

// Node interface with outgoing and incoming edge lists
export interface Node {
  id: string;
  value: number;
  outgoing_edges: Edge | null; // Head of outgoing edges list
  incoming_edges: Edge | null; // Head of incoming edges list
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  color?: string; // Optional stroke color propertyß
  fillColor?: string; // Optional fill color property
  useGradient?: boolean; // Optional gradient usage property
}

// Edge interface with doubly-linked list pointers
export interface Edge extends d3.SimulationLinkDatum<Node> {
  from_node: Node;
  to_node: Node;
  data: number | string | object; // Edge data/weight with specific types
  next_from: Edge | null; // Next edge in outgoing list
  prev_from: Edge | null; // Previous edge in outgoing list
  next_to: Edge | null;   // Next edge in incoming list
  prev_to: Edge | null;   // Previous edge in incoming list
  id: string;            // Unique identifier for the edge
}

// Graph class to manage nodes and edges
export class Graph {
  nodes: Record<string, Node> = {};
  
  add_node(node_id: string, value: number): void {
    if (!this.nodes[node_id]) {
      this.nodes[node_id] = {
        id: node_id,
        value,
        outgoing_edges: null,
        incoming_edges: null
      };
    }
  }
  
  // Helper method to generate consistent edge IDs regardless of direction
  _getEdgeId(nodeId1: string, nodeId2: string): string {
    return [nodeId1, nodeId2].sort().join('-');
  }
  
  // Check if an edge exists between two nodes (in either direction)
  hasEdge(nodeId1: string, nodeId2: string): boolean {
    if (!this.nodes[nodeId1] || !this.nodes[nodeId2]) return false;
    
    const node1 = this.nodes[nodeId1];
    let edge = node1.outgoing_edges;
    
    while (edge !== null) {
      if (edge.to_node.id === nodeId2) return true;
      edge = edge.next_from;
    }
    
    const node2 = this.nodes[nodeId2];
    edge = node2.outgoing_edges;
    
    while (edge !== null) {
      if (edge.to_node.id === nodeId1) return true;
      edge = edge.next_from;
    }
    
    return false;
  }
  
  add_edge(from_id: string, to_id: string, weight: number = 1): Edge | null {
    if (this.nodes[from_id] && this.nodes[to_id]) {
      // Skip if edge already exists in either direction
      if (this.hasEdge(from_id, to_id)) {
        return null;
      }
      
      const from_node = this.nodes[from_id];
      const to_node = this.nodes[to_id];
      
      // Create consistent edge ID regardless of direction
      const edgeId = this._getEdgeId(from_id, to_id);
      
      // Create edge
      const edge: Edge = {
        from_node,
        to_node,
        data: weight,
        next_from: null,
        prev_from: null,
        next_to: null,
        prev_to: null,
        id: edgeId,
        // Add these properties to satisfy SimulationLinkDatum interface
        source: from_node,
        target: to_node
      };
      
      // Add to outgoing list of from_node
      this._add_to_list(from_node, edge, 'outgoing');
      
      // Add to incoming list of to_node
      this._add_to_list(to_node, edge, 'incoming');
      
      return edge;
    }
    return null;
  }
  
  _add_to_list(node: Node, edge: Edge, list_type: 'outgoing' | 'incoming'): void {
    if (list_type === 'outgoing') {
      if (node.outgoing_edges === null) {
        node.outgoing_edges = edge;
      } else {
        let curr = node.outgoing_edges;
        while (curr.next_from !== null) {
          curr = curr.next_from;
        }
        curr.next_from = edge;
        edge.prev_from = curr;
      }
    } else { // incoming
      if (node.incoming_edges === null) {
        node.incoming_edges = edge;
      } else {
        let curr = node.incoming_edges;
        while (curr.next_to !== null) {
          curr = curr.next_to;
        }
        curr.next_to = edge;
        edge.prev_to = curr;
      }
    }
  }
  
  remove_edge(from_id: string, to_id: string): void {
    if (this.nodes[from_id] && this.nodes[to_id]) {
      const from_node = this.nodes[from_id];
      const to_node = this.nodes[to_id];
      
      // Remove from outgoing list
      this._remove_from_list(from_node, to_node, 'outgoing');
      
      // Remove from incoming list
      this._remove_from_list(to_node, from_node, 'incoming');
    }
  }
  
  _remove_from_list(node: Node, other_node: Node, list_type: 'outgoing' | 'incoming'): void {
    if (list_type === 'outgoing') {
      let curr = node.outgoing_edges;
      while (curr !== null) {
        if (curr.to_node.id === other_node.id) {
          if (curr.prev_from !== null) {
            curr.prev_from.next_from = curr.next_from;
          } else {
            node.outgoing_edges = curr.next_from;
          }
          
          if (curr.next_from !== null) {
            curr.next_from.prev_from = curr.prev_from;
          }
          break;
        }
        curr = curr.next_from;
      }
    } else { // incoming
      let curr = node.incoming_edges;
      while (curr !== null) {
        if (curr.from_node.id === other_node.id) {
          if (curr.prev_to !== null) {
            curr.prev_to.next_to = curr.next_to;
          } else {
            node.incoming_edges = curr.next_to;
          }
          
          if (curr.next_to !== null) {
            curr.next_to.prev_to = curr.prev_to;
          }
          break;
        }
        curr = curr.next_to;
      }
    }
  }
  
  // Get all edges in the graph as a flat array for visualization
  get_all_edges(): Edge[] {
    const edges: Edge[] = [];
    const visited = new Set<string>();
    
    Object.values(this.nodes).forEach(node => {
      let edge = node.outgoing_edges;
      while (edge !== null) {
        if (!visited.has(edge.id)) {
          edges.push(edge);
          visited.add(edge.id);
        }
        edge = edge.next_from;
      }
    });
    
    return edges;
  }
}

/**
 * Creates a random graph with the specified parameters
 * @param nodeCount Number of nodes to create
 * @param edgeDensity Density of edges (0-1), where 1 means all possible edges
 * @param minValue Minimum value for node values
 * @param maxValue Maximum value for node values
 * @param nodeColorOptions Optional color settings for nodes
 * @returns A new Graph instance
 */
export function createRandomGraph(
  nodeCount: number, 
  edgeDensity: number = 0.3, 
  minValue: number = 1, 
  maxValue: number = 20,
  nodeColorOptions?: { 
    defaultColor?: string;
    defaultFillColor?: string;
    useGradient?: boolean;
  }
): Graph {
  const graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    
    // Store node color options directly in the node object
    const node: Node = {
      id: `node-${i}`,
      value,
      outgoing_edges: null,
      incoming_edges: null
    };
    
    // Add custom color properties if provided
    if (nodeColorOptions) {
      // Ensure none of these are undefined
      node.color = nodeColorOptions.defaultColor || "hsl(210, 100%, 50%)";
      node.fillColor = nodeColorOptions.defaultFillColor || "hsl(210, 100%, 40%)";
      // Explicitly set useGradient to avoid undefined
      node.useGradient = nodeColorOptions.useGradient !== undefined ? 
        nodeColorOptions.useGradient : true;
    }
    
    graph.nodes[node.id] = node;
  }
  
  // Create random edges
  const nodeIds = Object.keys(graph.nodes);
  
  // Calculate max edges for an undirected graph - each pair can have at most 1 edge
  const possibleEdgePairs = (nodeCount * (nodeCount - 1)) / 2;
  const maxEdges = Math.floor(possibleEdgePairs * edgeDensity);
  
  // Ensure the graph is connected (minimum spanning tree)
  const connected = new Set<string>();
  const unconnected = new Set<string>(nodeIds);
  
  // Start with a random node
  const startNodeId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
  connected.add(startNodeId);
  unconnected.delete(startNodeId);
  
  // Connect all nodes
  while (unconnected.size > 0) {
    const fromId = Array.from(connected)[Math.floor(Math.random() * connected.size)];
    const toId = Array.from(unconnected)[Math.floor(Math.random() * unconnected.size)];
    
    const weight = Math.floor(Math.random() * 10) + 1;
    graph.add_edge(fromId, toId, weight);
    
    connected.add(toId);
    unconnected.delete(toId);
  }
  
  // Add additional random edges up to desired density
  let edgeCount = nodeCount - 1; // Already added n-1 edges for connectivity
  
  // Create a list of all possible node pairs
  const possiblePairs: [string, string][] = [];
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      possiblePairs.push([nodeIds[i], nodeIds[j]]);
    }
  }
  
  // Shuffle the possible pairs to add edges randomly
  shuffleArray(possiblePairs);
  
  // Add edges until we reach the desired density
  for (const [fromId, toId] of possiblePairs) {
    // Check if we've reached the maximum
    if (edgeCount >= maxEdges) break;
    
    // Skip if edge already exists
    if (graph.hasEdge(fromId, toId)) continue;
    
    const weight = Math.floor(Math.random() * 10) + 1;
    graph.add_edge(fromId, toId, weight);
    edgeCount++;
  }
  
  return graph;
}


// Helper function to shuffle array
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Enhanced Highlight interfaces - expanded to support more styling options
export interface NodeHighlight {
  nodeId: string;
  color: string;
  fillColor?: string; // Optional separate fill color
  useGradient?: boolean; // Whether to use gradient (default true)
}

export interface EdgeHighlight {
  sourceId: string;
  targetId: string;
  color: string;
  width?: number; // Optional line width
}

// Background color options interface
export interface BackgroundOptions {
  gradientStart?: string;
  gradientEnd?: string;
  useGradient?: boolean;
}

// GraphVisualizer props interface
export interface GraphVisualizerProps {
  width: number;
  height: number;
  graph: Graph;
  highlightedNodes?: NodeHighlight[];
  highlightedEdges?: EdgeHighlight[];
  onNodeHover?: (nodeId: string | null) => void; // Add new callback prop
  backgroundOptions?: BackgroundOptions; // New background options
}

// Main GraphVisualizer component
export const GraphVisualizer: FC<GraphVisualizerProps> = ({
  width,
  height,
  graph,
  highlightedNodes = [],
  highlightedEdges = [],
  onNodeHover,
  backgroundOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' && window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const highlightedNodesRef = useRef(highlightedNodes);
  const highlightedEdgesRef = useRef(highlightedEdges);
  const backgroundOptionsRef = useRef(backgroundOptions);

  // At the start of your component or effect
  useEffect(() => {
    highlightedNodesRef.current = highlightedNodes;
    highlightedEdgesRef.current = highlightedEdges;
    backgroundOptionsRef.current = backgroundOptions;
  }, [highlightedNodes, highlightedEdges, backgroundOptions]);

  // Main effect for graph rendering and visualization
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const nodes = Object.values(graph.nodes);
    const edges = graph.get_all_edges();

    // Store local references to props to include in the dependency array
    const currentHighlightedNodes = highlightedNodesRef.current;
    const currentHighlightedEdges = highlightedEdgesRef.current;

    // Build lookup maps for highlights with enhanced styling options
    const highlightedNodesMap = new Map<string, NodeHighlight>();
    currentHighlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, {
      ...hl,
      useGradient: hl.useGradient !== false // Default to true if not specified
    }));
    
    const highlightedEdgesMap = new Map<string, EdgeHighlight>();
    currentHighlightedEdges.forEach(hl => {
      // Generate consistent edge ID for undirected edges
      const edgeId = [hl.sourceId, hl.targetId].sort().join('-');
      highlightedEdgesMap.set(edgeId, hl);
    });

    // Theme-based colors
    const bgGradientStart = backgroundOptionsRef.current?.gradientStart || 
      (isDarkMode ? 'hsl(0, 0.00%, 11.80%)' : 'hsl(220, 13%, 95%)');
    const bgGradientEnd = backgroundOptionsRef.current?.gradientEnd || 
      (isDarkMode ? 'hsl(240, 87.00%, 30.20%)' : 'hsl(220, 13%, 90%)');
    const useBackgroundGradient = backgroundOptionsRef.current?.useGradient !== false; // Default to true
    const defaultNodeGradientStart = isDarkMode ? 'hsl(0, 98.00%, 38.60%)' : 'hsl(210, 100%, 50%)';
    const defaultNodeGradientEnd = isDarkMode ? 'hsl(210, 100%, 40%)' : 'hsl(210, 100%, 40%)';
    const defaultLinkColor = isDarkMode ? 'hsl(0, 0%, 60%)' : 'hsl(0, 0%, 70%)';
    const textColor = 'white';

    // Add a subtle gradient background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", useBackgroundGradient ? "url(#gradient-bg)" : bgGradientStart)
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
      .attr("stop-opacity", 0.8);
      
    bgGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", bgGradientEnd)
      .attr("stop-opacity", 0.6);
      
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
      // Use fillColor if provided, otherwise use the main color for both stroke and fill
      const primaryColor = hl.fillColor || hl.color;
      
      // Create a lighter version of the highlight color for gradient
      const lighterColor = d3.color(primaryColor)?.brighter(0.3)?.toString() || primaryColor;
      
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
        .attr("stop-color", primaryColor);
    });
    
    // Create custom gradients for non-highlighted nodes with custom colors
    nodes.forEach(node => {
      // Create a gradient for every node with custom colors that doesn't already have one
      // This ensures all nodes have their own gradient definitions
      if (node.fillColor && !highlightedNodesMap.has(node.id)) {
        const primaryColor = node.fillColor;
        const lighterColor = d3.color(primaryColor)?.brighter(0.3)?.toString() || primaryColor;
        
        const nodeCustomGradient = defs.append("linearGradient")
          .attr("id", `gradient-node-${node.id}`)
          .attr("x1", "0%")
          .attr("y1", "0%")
          .attr("x2", "0%")
          .attr("y2", "100%");
          
        nodeCustomGradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", lighterColor);
          
        nodeCustomGradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", primaryColor);
      }
    });
    
    // Create D3 selections with improved styling
    const linkGroup = svg.append("g");
    
    const link = linkGroup
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", d => {
        // Use the edge ID which is now consistent regardless of direction
        const highlight = highlightedEdgesMap.get(d.id);
        return highlight ? highlight.color : defaultLinkColor;
      })
      .attr("stroke-opacity", d => highlightedEdgesMap.has(d.id) ? 0.8 : 0.5)
      .attr("stroke-width", d => {
        // First check if there's a custom width from highlighting
        const highlight = highlightedEdgesMap.get(d.id);
        if (highlight && highlight.width) {
          return highlight.width;
        }
        
        // Otherwise use edge.data as weight
        const weight = typeof d.data === 'number' ? d.data : 1;
        const baseWidth = highlightedEdgesMap.has(d.id) ? 2.5 : 1.5;
        return baseWidth * Math.sqrt(weight) / 2;
      })
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
        Math.min(width, height) / (Math.sqrt(nodes.length) * 3)
      )
    );
    
    const nodeGroup = svg.append("g");

    const node = nodeGroup
      .selectAll<SVGCircleElement, Node>("circle")
      .data(nodes)
      .join<SVGCircleElement>("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => {
        // First check if this is a highlighted node
        if (highlightedNodesMap.has(d.id)) {
          const highlight = highlightedNodesMap.get(d.id)!;
          // Only use gradient if useGradient is true or not specified
          return highlight.useGradient !== false ? 
            `url(#gradient-node-${d.id})` : 
            highlight.fillColor || highlight.color;
        }
        // Then check if the node has custom colors from creation
        else if (d.fillColor && d.useGradient !== false) {
          return `url(#gradient-node-${d.id})`;
        }
        else if (d.fillColor) {
          // Use solid fill color if gradient is disabled
          return d.fillColor;
        }
        // Default gradient
        return "url(#gradient-node)";
      })
      .attr("filter", d => highlightedNodesMap.has(d.id) ? "url(#glow)" : "url(#shadow)")
      .attr("stroke", d => {
        if (highlightedNodesMap.has(d.id)) {
          return highlightedNodesMap.get(d.id)!.color;
        }
        // Use custom stroke color if defined in the node
        else if (d.color) {
          return d.color;
        }
        return "white";
      })
      .attr("stroke-width", d => highlightedNodesMap.has(d.id) ? 2 : 1.5)
      .attr("stroke-opacity", 0.8)
      // Add hover event handlers
      .on("mouseenter", function(event, d) {
        // Type assertion to fix TypeScript error
        const node = d as Node;
        
        // Call the hover callback if provided
        if (onNodeHover) onNodeHover(node.id);
        
        // Add visual hover effect
        d3.select(this)
          .transition().duration(150)
          .attr("r", nodeRadius * 1.1) // Slightly larger
          .attr("stroke-width", () => highlightedNodesMap.has(node.id) ? 3 : 2.5);
      })
      .on("mouseleave", function(event, d) {
        // Type assertion to fix TypeScript error
        const node = d as Node;
        
        // Reset the hover state
        if (onNodeHover) onNodeHover(null);
        
        // Restore normal appearance
        d3.select(this)
          .transition().duration(150)
          .attr("r", nodeRadius)
          .attr("stroke-width", () => highlightedNodesMap.has(node.id) ? 2 : 1.5);
      })
      .call(d3.drag<SVGCircleElement, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
    
    // Calculate appropriate font size based on node radius
    const fontSize = Math.max(10, Math.min(14, nodeRadius * 0.6));
    
    const text = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.value.toString())
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", d => highlightedNodesMap.has(d.id) ? "700" : "500")
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("dy", "0.35em");
    
    // Add edge weight labels - make them smaller and more subtle
  const edgeLabelFontSize = Math.max(8, Math.min(10, nodeRadius * 0.4));

  // Create background for edge labels - only fully visible when highlighted
  const edgeLabelBackground = svg.append("g")
    .selectAll("rect")
    .data(edges)
    .join("rect")
    .attr("fill", isDarkMode ? "rgba(30, 41, 59, 0.6)" : "rgba(255, 255, 255, 0.7)")
    .attr("rx", 3)
    .attr("ry", 3)
    .attr("stroke", d => {
      const highlight = highlightedEdgesMap.get(d.id);
      return highlight ? highlight.color : "transparent";
    })
    .attr("stroke-width", 1)
    .attr("width", d => {
      const weight = typeof d.data === 'number' ? d.data.toString() : "1";
      return weight.length * edgeLabelFontSize * 0.7 + 8;
    })
    .attr("height", edgeLabelFontSize + 4)
    .attr("opacity", d => highlightedEdgesMap.has(d.id) ? 0.9 : 0.4);

  // Add text elements for edge weights - lower opacity for non-highlighted
  const edgeLabels = svg.append("g")
    .selectAll("text")
    .data(edges)
    .join("text")
    .text(d => typeof d.data === 'number' ? d.data.toString() : "1")
    .attr("font-size", `${edgeLabelFontSize}px`)
    .attr("font-weight", d => highlightedEdgesMap.has(d.id) ? "600" : "400")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .attr("fill", isDarkMode ? "hsl(0, 0%, 95%)" : "hsl(0, 0%, 20%)")
    .attr("opacity", d => highlightedEdgesMap.has(d.id) ? 0.95 : 0.5);

    // Calculate appropriate force parameters based on container size
    const optimalLinkDistance = Math.min(width, height) / Math.max(4, Math.sqrt(nodes.length));
    const chargeStrength = -Math.min(
      1000, // Increased max strength for better spreading
      Math.max(
        400, // Increased min strength
        Math.min(width, height) / 2
      )
    );

    // Set up force simulation with our edge structure
    const simulation = d3.forceSimulation<Node>(nodes)
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.1))
      .force("link", (() => {
        const forceLink = d3.forceLink<Node, Edge>(edges)
          .id(d => d.id);
          
        return forceLink
          .distance(d => {
            // Heavier edges pull nodes closer together
            const weight = typeof d.data === 'number' ? d.data : 1;
            return optimalLinkDistance / Math.sqrt(weight);
          })
          .strength(d => {
            const weight = typeof d.data === 'number' ? d.data : 1;
            return 0.5 + (weight / 10);
          });
      })())
      .force("charge", d3.forceManyBody().strength(chargeStrength))
      .force("collide", d3.forceCollide<Node>().radius(nodeRadius * 1.8).strength(0.95))
      .force("bounds", () => {
        const padding = Math.max(nodeRadius * 2, Math.min(width, height) * 0.08);
        for (const node of nodes) {
          if (node.x! < padding) node.x = padding;
          if (node.x! > width - padding) node.x = width - padding;
          if (node.y! < padding) node.y = padding;
          if (node.y! > height - padding) node.y = height - padding;
        }
      });

    // Add interactivity with drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      // Constrain dragging within bounds
      const padding = nodeRadius;
      d.fx = Math.max(padding, Math.min(width - padding, event.x));
      d.fy = Math.max(padding, Math.min(height - padding, event.y));
    }
    
    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>, d: Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.from_node.x || 0)
        .attr("y1", d => d.from_node.y || 0)
        .attr("x2", d => d.to_node.x || 0)
        .attr("y2", d => d.to_node.y || 0);
        
      // Position edge labels
      edges.forEach((edge, i) => {
        const sourceX = edge.from_node.x || 0;
        const sourceY = edge.from_node.y || 0;
        const targetX = edge.to_node.x || 0;
        const targetY = edge.to_node.y || 0;
        
        // Position in the middle of the edge
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;
        
        // Calculate a slight offset perpendicular to the edge
        // This moves the label slightly to the side of the edge for better visibility
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        // Only create offset if edge is long enough
        if (length > nodeRadius * 3) {
          // Increase offset to move labels further from edges
          const offsetScale = 0.25;
          const offsetX = (dy / length) * nodeRadius * offsetScale;
          const offsetY = (-dx / length) * nodeRadius * offsetScale;
          
          // Apply the position to the rectangle and text
          d3.select(edgeLabelBackground.nodes()[i])
            .attr("x", midX + offsetX - parseInt(d3.select(edgeLabelBackground.nodes()[i]).attr("width")) / 2)
            .attr("y", midY + offsetY - parseInt(d3.select(edgeLabelBackground.nodes()[i]).attr("height")) / 2);
            
          d3.select(edgeLabels.nodes()[i])
            .attr("x", midX + offsetX)
            .attr("y", midY + offsetY);
        } else {
          // For short edges, just hide the labels completely
          d3.select(edgeLabelBackground.nodes()[i]).attr("opacity", 0);
          d3.select(edgeLabels.nodes()[i]).attr("opacity", 0);
        }
      });
        
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, dimensions, isDarkMode, onNodeHover]); // Add onNodeHover to dependency array
  
  /**
   * Effect to handle highlights
   */
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Local copies of the component props to use in the effect
    const localHighlightedNodes = highlightedNodesRef.current;
    const localHighlightedEdges = highlightedEdgesRef.current;

    // Recreate lookup maps for highlights with enhanced styling
    const highlightedNodesMap = new Map<string, NodeHighlight>();
    localHighlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, {
      ...hl,
      useGradient: hl.useGradient !== false // Default to true if not specified
    }));
    
    const highlightedEdgesMap = new Map<string, EdgeHighlight>();
    localHighlightedEdges.forEach(hl => {
      // Generate consistent edge ID for undirected edges
      const edgeId = [hl.sourceId, hl.targetId].sort().join('-');
      highlightedEdgesMap.set(edgeId, hl);
    });
    
    // We need to recreate the gradients for any highlighted nodes
    const defs = svg.select("defs");
    if (!defs.empty()) {
      // First remove any existing highlight gradients
      defs.selectAll("[id^='gradient-node-']").remove();
      
      // Then recreate them for the current highlighted nodes
      localHighlightedNodes.forEach(hl => {
        // Only create gradient if useGradient isn't explicitly false
        if (hl.useGradient !== false) {
          // Use fillColor if provided, otherwise use the main color for both stroke and fill
          const primaryColor = hl.fillColor || hl.color;
          
          // Create a lighter version of the highlight color for gradient
          const lighterColor = d3.color(primaryColor)?.brighter(0.3)?.toString() || primaryColor;
          
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
            .attr("stop-color", primaryColor);
        }
      });
    }
     
    // Update nodes with proper gradient or solid color
    svg.selectAll<SVGCircleElement, Node>("circle")
      .each(function(d: Node) {
        const node = d3.select(this);
        const isHighlighted = highlightedNodesMap.has(d.id);
        
        // Figure out what fill to use
        let fillValue: string;
        if (isHighlighted) {
          const highlight = highlightedNodesMap.get(d.id)!;
          if (highlight.useGradient !== false) {
            fillValue = `url(#gradient-node-${d.id})`;
          } else {
            fillValue = highlight.fillColor || highlight.color;
          }
        } else {
          fillValue = "url(#gradient-node)"; // default gradient
        }
        
        // Apply all attributes in a single transition per node
        node.transition().duration(300)
          .attr("fill", fillValue)
          .attr("filter", isHighlighted ? "url(#glow)" : "url(#shadow)")
          .attr("stroke", isHighlighted ? highlightedNodesMap.get(d.id)!.color : "white")
          .attr("stroke-width", isHighlighted ? 2 : 1.5)
          .attr("opacity", 1)
          .attr("pointer-events", "all");
      });
  
    // Update links
    svg.selectAll<SVGLineElement, Edge>("line")
      .transition().duration(300)
      .attr("stroke", (d: Edge) => {
        const highlight = d.id ? highlightedEdgesMap.get(d.id) : undefined;
        return highlight ? highlight.color : (isDarkMode ? 'hsl(220, 13%, 45%)' : 'hsl(220, 13%, 75%)');
      })
      .attr("stroke-width", (d: Edge) => {
        const highlight = d.id ? highlightedEdgesMap.get(d.id) : undefined;
        if (highlight && highlight.width) {
          return highlight.width;
        }
        
        const weight = typeof d.data === 'number' ? d.data : 1;
        const baseWidth = d.id && highlightedEdgesMap.has(d.id) ? 2.5 : 1.5;
        return baseWidth * Math.sqrt(weight) / 2;
      })
      .attr("stroke-opacity", (d: Edge) => d.id && highlightedEdgesMap.has(d.id) ? 0.8 : 0.5);

    // Update the edge labels
    svg.selectAll<SVGRectElement, Edge>("rect")
      .transition().duration(300)
      .attr("opacity", (d: Edge) => {
        if (d && d.id && highlightedEdgesMap.has(d.id)) return 0.9;
        return 0.6;
      })
      .attr("stroke", (d: Edge) => {
        const highlight = d && d.id ? highlightedEdgesMap.get(d.id) : undefined;
        return highlight ? highlight.color : "transparent";
      });

    // Update edge label text
    svg.selectAll<SVGTextElement, Edge>("text")
      .filter((d: Edge) => d && d.id !== undefined)
      .transition().duration(300)
      .attr("opacity", (d: Edge) => {
        if (d.id && highlightedEdgesMap.has(d.id)) return 0.95;
        return 0.7;
      });
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
      className="w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800"
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
