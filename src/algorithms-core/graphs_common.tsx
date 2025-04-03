import * as d3 from "d3";
import { FC, useEffect, useRef, useState } from "react";

// Interface to extend d3.ForceLink to properly type source and target accessors
interface D3ForceLink<NodeDatum extends d3.SimulationNodeDatum, LinkDatum extends d3.SimulationLinkDatum<NodeDatum>> 
  extends d3.ForceLink<NodeDatum, LinkDatum> {
  source(accessor: (d: LinkDatum) => NodeDatum | string | number): this;
  target(accessor: (d: LinkDatum) => NodeDatum | string | number): this;
}

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
}

// Edge interface with doubly-linked list pointers
export interface Edge extends d3.SimulationLinkDatum<Node> {
  from_node: Node;
  to_node: Node;
  data: any; // Edge data/weight
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
  
  add_edge(from_id: string, to_id: string, weight: number = 1): Edge | null {
    if (this.nodes[from_id] && this.nodes[to_id]) {
      const from_node = this.nodes[from_id];
      const to_node = this.nodes[to_id];
      
      const edge: Edge = {
        from_node,
        to_node,
        data: weight,
        next_from: null,
        prev_from: null,
        next_to: null,
        prev_to: null,
        id: `${from_id}-${to_id}`,
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
 * 
 * @param nodeCount 
 * @param edgeDensity 
 * @param minValue 
 * @param maxValue 
 * @returns 
 */
export function createRandomGraph(nodeCount: number, edgeDensity: number = 0.3, minValue: number = 1, maxValue: number = 20): Graph {
  const graph = new Graph();
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const value = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    graph.add_node(`node-${i}`, value);
  }
  
  // Create random edges
  const nodeIds = Object.keys(graph.nodes);
  const maxEdges = Math.floor(nodeCount * (nodeCount - 1) * edgeDensity);
  
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
  
  while (edgeCount < maxEdges) {
    const fromId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    const toId = nodeIds[Math.floor(Math.random() * nodeIds.length)];
    
    // Skip self-loops
    if (fromId === toId) continue;
    
    // Check if edge already exists
    let existingEdge = false;
    let curr = graph.nodes[fromId].outgoing_edges;
    
    while (curr !== null) {
      if (curr.to_node.id === toId) {
        existingEdge = true;
        break;
      }
      curr = curr.next_from;
    }
    
    if (!existingEdge) {
      const weight = Math.floor(Math.random() * 10) + 1;
      graph.add_edge(fromId, toId, weight);
      edgeCount++;
    }
  }
  
  return graph;
}

// Highlight interfaces
export interface NodeHighlight {
  nodeId: string;
  color: string;
}

export interface EdgeHighlight {
  sourceId: string;
  targetId: string;
  color: string;
}

// GraphVisualizer props interface
export interface GraphVisualizerProps {
  width: number;
  height: number;
  graph: Graph;
  highlightedNodes?: NodeHighlight[];
  highlightedEdges?: EdgeHighlight[];
}

// Main GraphVisualizer component
export const GraphVisualizer: FC<GraphVisualizerProps> = ({
  width,
  height,
  graph,
  highlightedNodes = [],
  highlightedEdges = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' && window.matchMedia && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const nodes = Object.values(graph.nodes);
    const edges = graph.get_all_edges();

    // Build lookup maps for highlights
    const highlightedNodesMap = new Map<string, string>();
    highlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, hl.color));
    
    const highlightedEdgesMap = new Map<string, string>();
    highlightedEdges.forEach(hl => {
      highlightedEdgesMap.set(`${hl.sourceId}-${hl.targetId}`, hl.color);
    });

    // Theme-based colors
    const bgGradientStart = isDarkMode ? 'hsl(220, 13%, 18%)' : 'hsl(220, 13%, 95%)';
    const bgGradientEnd = isDarkMode ? 'hsl(220, 13%, 15%)' : 'hsl(220, 13%, 90%)';
    const defaultNodeGradientStart = isDarkMode ? 'hsl(210, 100%, 50%)' : 'hsl(210, 100%, 50%)';
    const defaultNodeGradientEnd = isDarkMode ? 'hsl(210, 100%, 40%)' : 'hsl(210, 100%, 40%)';
    const defaultLinkColor = isDarkMode ? 'hsl(0, 0%, 60%)' : 'hsl(0, 0%, 70%)';
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
    
    // Create D3 selections with improved styling
    const linkGroup = svg.append("g");
    
    const link = linkGroup
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", d => {
        const highlightColor = highlightedEdgesMap.get(d.id);
        return highlightColor || defaultLinkColor;
      })
      .attr("stroke-opacity", d => highlightedEdgesMap.has(d.id) ? 0.8 : 0.5)
      .attr("stroke-width", d => {
        // Use edge.data as weight
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
      .selectAll("circle")
      .data(nodes)
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
      .data(nodes)
      .join("text")
      .text(d => d.value.toString())
      .attr("font-size", `${fontSize}px`)
      .attr("font-weight", d => highlightedNodesMap.has(d.id) ? "700" : "500")
      .attr("text-anchor", "middle")
      .attr("fill", textColor)
      .attr("dy", "0.35em");
    
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
        .attr("x1", d => d.from_node.x || 0)
        .attr("y1", d => d.from_node.y || 0)
        .attr("x2", d => d.to_node.x || 0)
        .attr("y2", d => d.to_node.y || 0);
        
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
  }, [graph, dimensions, isDarkMode, highlightedNodes, highlightedEdges]);
  
  // Separate effect: update highlights only
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    // Recreate lookup maps for highlights
    const highlightedNodesMap = new Map<string, string>();
    highlightedNodes.forEach(hl => highlightedNodesMap.set(hl.nodeId, hl.color));
    const highlightedEdgesMap = new Map<string, string>();
    highlightedEdges.forEach(hl => {
      highlightedEdgesMap.set(`${hl.sourceId}-${hl.targetId}`, hl.color);
    });

    // Update node selection individually without removing them
    svg.selectAll<SVGCircleElement, Node>("circle")
      .transition().duration(300)
      .attr("fill", (d: Node) => 
        highlightedNodesMap.has(d.id) ? `url(#gradient-node-${d.id})` : "url(#gradient-node)"
      )
      .attr("filter", d => highlightedNodesMap.has(d.id) ? "url(#glow)" : "url(#shadow)")
      .attr("stroke", (d: Node) => 
        highlightedNodesMap.has(d.id) ? highlightedNodesMap.get(d.id)! : "white"
      );

    // Update links similarly with proper type cast
    svg.selectAll<SVGLineElement, Edge>("line")
      .transition().duration(300)
      .attr("stroke", (d: Edge) => {
        const highlightColor = highlightedEdgesMap.get(d.id);
        return highlightColor ? highlightColor : (isDarkMode ? 'hsl(220, 13%, 45%)' : 'hsl(220, 13%, 75%)');
      })
      .attr("stroke-width", (d: Edge) => {
        const weight = typeof d.data === 'number' ? d.data : 1;
        const baseWidth = highlightedEdgesMap.has(d.id) ? 2.5 : 1.5;
        return baseWidth * Math.sqrt(weight) / 2;
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
