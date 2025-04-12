"use client";

import React, { useState, FC, useRef, useEffect, useCallback } from "react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { dijkstra, DijkstraStep, DijkstraResult } from "@/algorithms-core/dijkstras";

import { 
  GraphVisualizer, 
  NodeHighlight,
  EdgeHighlight,
  createRandomGraph,
  Graph
} from "@/algorithms-core/graphs_common";

// Define theme colors for the visualization in one place for easy customization
const COLORS = {
  // Node colors
  START_NODE: { color: "hsl(120, 100%, 40%)", fillColor: "hsl(120, 100%, 35%)" },
  CURRENT_NODE: { color: "hsl(270, 100%, 70%)", fillColor: "hsl(270, 100%, 60%)" },
  VISITED_NODE: { color: "hsl(217, 100%, 18%)", fillColor: "hsl(217, 100%, 30%)" },
  NEXT_NODE: { color: "hsl(45, 100%, 50%)", fillColor: "hsl(45, 100%, 45%)" },
  
  // Default node colors when not highlighted
  DEFAULT_NODE: { color: "hsl(210, 100%, 50%)", fillColor: "hsl(210, 100%, 40%)" },
  
  // Edge colors
  SHORTEST_PATH: "hsl(150, 100%, 40%)",
  CONSIDERING_EDGE: "hsl(200, 100%, 60%)",
  
  // Background colors
  BACKGROUND: { 
    gradientStart: "hsl(220, 13%, 95%)", 
    gradientEnd: "hsl(220, 13%, 90%)",
    darkGradientStart: "hsl(0, 0%, 12%)",
    darkGradientEnd: "hsl(240, 87%, 30%)"
  },
  
  // Control whether gradients are used for node fills
  USE_GRADIENT: true
};

// Helper function for conditional debug logging
function debugLog(debug: boolean, ...args: unknown[]): void {
  if (debug) {
    console.log(...args);
  }
}

const DijkstrasPage: FC = () => {
  const [graph, setGraph] = useState<Graph | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<NodeHighlight[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<EdgeHighlight[]>([]);
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [algorithmResult, setAlgorithmResult] = useState<DijkstraResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [graphDensity, setGraphDensity] = useState<number>(0.1);
  const [graphSize, setGraphSize] = useState<number>(14);
  const [debug, setDebug] = useState<boolean>(false);
  const [useGradient, setUseGradient] = useState<boolean>(COLORS.USE_GRADIENT);
  
  // Add background color state
  const [backgroundOptions, setBackgroundOptions] = useState({
    gradientStart: COLORS.BACKGROUND.gradientStart,
    gradientEnd: COLORS.BACKGROUND.gradientEnd,
    useGradient: true
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleResetGraph = useCallback(() => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
      setIsAutoPlaying(false);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
    setAlgorithmResult(null);

    const newGraph = createRandomGraph(
      graphSize, 
      graphDensity,
      1, // minValue
      30, // maxValue
      {
        defaultColor: COLORS.DEFAULT_NODE.color,
        defaultFillColor: COLORS.DEFAULT_NODE.fillColor,
        useGradient: useGradient
      }
    );
    setGraph(newGraph);
    const nodeIds = Object.keys(newGraph.nodes);
    if (nodeIds.length > 0) {
      const startId = nodeIds[0];
      setStartNodeId(startId);
      
      // Create a highlighted nodes array with ALL nodes to ensure proper coloring
      const newHighlightedNodes: NodeHighlight[] = [];
      
      // Add the start node with START_NODE color
      newHighlightedNodes.push({ 
        nodeId: startId, 
        color: COLORS.START_NODE.color,
        fillColor: COLORS.START_NODE.fillColor,
        useGradient: useGradient
      });
      
      // Add all other nodes with DEFAULT_NODE color
      nodeIds.forEach(nodeId => {
        if (nodeId !== startId) {
          newHighlightedNodes.push({
            nodeId,
            color: COLORS.DEFAULT_NODE.color,
            fillColor: COLORS.DEFAULT_NODE.fillColor,
            useGradient: useGradient
          });
        }
      });
      
      setHighlightedNodes(newHighlightedNodes);
      setHighlightedEdges([]);
    }
  }, [graphSize, graphDensity, useGradient, setGraph, setStartNodeId, setHighlightedNodes, setHighlightedEdges, setIsAutoPlaying, setIsRunning, setCurrentStepIndex, setAlgorithmResult]); // Added dependencies for useCallback
  
  /**
   * Effect to initialize the graph when the component mounts or when graphSize or graphDensity changes.
   */
  useEffect(() => {
    handleResetGraph();
  }, [handleResetGraph]); // Now only depends on the memoized handleResetGraph

  // Effect to handle  dark mode
  useEffect(() => {
    const isDark = typeof window !== 'undefined' && 
                  window.matchMedia && 
                  window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Update background colors based on dark mode
    setBackgroundOptions({
      gradientStart: isDark ? COLORS.BACKGROUND.darkGradientStart : COLORS.BACKGROUND.gradientStart,
      gradientEnd: isDark ? COLORS.BACKGROUND.darkGradientEnd : COLORS.BACKGROUND.gradientEnd,
      useGradient: true
    });
  }, []);

  const handleRunDijkstra = () => {
    if (!startNodeId || !graph) {
      debugLog(debug, "Missing start node or no graph");
      return;
    }

    try {
      const result = dijkstra(graph, startNodeId, debug);
      debugLog(debug, "Dijkstra algorithm completed. Steps:", result.steps.length);
      setAlgorithmResult(result);
      setCurrentStepIndex(0);
      setIsRunning(true);
      updateVisualization(result.steps[0], result);
    } catch (error) {
      debugLog(debug, "Error running Dijkstra's algorithm:", error);
    }
  };

  const handleToggleAutoPlay = () => {
    if (!algorithmResult) return;

    if (isAutoPlaying) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsAutoPlaying(false);
      return;
    }

    setIsAutoPlaying(true);

    // If already at the end, start over
    if (currentStepIndex >= algorithmResult.steps.length - 1) {
      setCurrentStepIndex(0);
      updateVisualization(algorithmResult.steps[0], algorithmResult);
    }

    autoPlayIntervalRef.current = setInterval(() => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= algorithmResult!.steps.length) {
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          setIsAutoPlaying(false);
          return prevIndex;
        }
        updateVisualization(algorithmResult!.steps[nextIndex], algorithmResult!);
        return nextIndex;
      });
    }, 750);
  };

  const handleStepForward = () => {
    if (!algorithmResult || currentStepIndex >= algorithmResult.steps.length - 1) return;
    const nextStepIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIndex);
    updateVisualization(algorithmResult.steps[nextStepIndex], algorithmResult);
  };

  const handleStepBackward = () => {
    if (!algorithmResult || currentStepIndex <= 0) return;
    const prevStepIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevStepIndex);
    updateVisualization(algorithmResult.steps[prevStepIndex], algorithmResult);
  };

  const updateVisualization = (step: DijkstraStep, resultToUse?: DijkstraResult) => {
    const result = resultToUse || algorithmResult;
    if (!startNodeId || !result || !graph) {
      debugLog(debug, "Cannot update visualization: missing data");
      return;
    }

    debugLog(debug, "Updating visualization for step:", currentStepIndex);
    debugLog(debug, "Step data:", {
      currentNodeId: step.currentNodeId,
      visitedCount: step.visited.size,
      unvisitedCount: step.unvisited.size
    });

    const newHighlightedNodes: NodeHighlight[] = [];
    const newHighlightedEdges: EdgeHighlight[] = [];

    // Always highlight the start node
    newHighlightedNodes.push({ 
      nodeId: startNodeId, 
      color: COLORS.START_NODE.color,
      fillColor: COLORS.START_NODE.fillColor,
      useGradient: useGradient
    });

    // Highlight current processing node
    if (step.currentNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentNodeId,
        color: COLORS.CURRENT_NODE.color,
        fillColor: COLORS.CURRENT_NODE.fillColor,
        useGradient: useGradient
      });
      
      // Highlight edges from current node to unvisited nodes being considered
      if (graph && step.currentNodeId) {
        const currentNode = graph.nodes[step.currentNodeId];
        
        // Iterate through outgoing edges
        let edge = currentNode.outgoing_edges;
        while (edge !== null) {
          // Only highlight edges to unvisited nodes (those we're considering)
          if (step.unvisited.has(edge.to_node.id)) {
            newHighlightedEdges.push({
              sourceId: step.currentNodeId,
              targetId: edge.to_node.id,
              color: COLORS.CONSIDERING_EDGE
            });
          }
          edge = edge.next_from;
        }
      }
    }

    // Highlight fully visited nodes
    step.visited.forEach(nodeId => {
      if (nodeId !== startNodeId && nodeId !== step.currentNodeId) {
        newHighlightedNodes.push({
          nodeId,
          color: COLORS.VISITED_NODE.color,
          fillColor: COLORS.VISITED_NODE.fillColor,
          useGradient: useGradient
        });
      }
    });

    // Highlight next shortest (unvisited) node in yellow
    if (step.currentShortest && step.currentShortest !== startNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentShortest,
        color: COLORS.NEXT_NODE.color,
        fillColor: COLORS.NEXT_NODE.fillColor,
        useGradient: useGradient
      });
    }

    // Track which nodes are highlighted
    const highlightedNodeIds = new Set(newHighlightedNodes.map(n => n.nodeId));

    // For all non-highlighted nodes, preserve their custom colors from the graph
    Object.keys(graph.nodes).forEach(nodeId => {
      if (!highlightedNodeIds.has(nodeId)) {
        const node = graph.nodes[nodeId];
        // Always add non-highlighted nodes to ensure they get their colors from the graph
        newHighlightedNodes.push({
          nodeId,
          color: node.color || COLORS.DEFAULT_NODE.color,
          fillColor: node.fillColor || COLORS.DEFAULT_NODE.fillColor,
          useGradient: node.useGradient !== undefined ? node.useGradient : useGradient
        });
      }
    });

    // Add path visualization for current shortest paths
    if (step.distances.size > 0 && step.previous.size > 0) {
      // Highlight the shortest path to the current shortest node
      if (step.currentShortest) {
        let pathNodeId = step.currentShortest;
        while (pathNodeId && pathNodeId !== startNodeId) {
          const prevNodeId = step.previous.get(pathNodeId);
          if (prevNodeId) {
            newHighlightedEdges.push({
              sourceId: prevNodeId,
              targetId: pathNodeId,
              color: COLORS.SHORTEST_PATH,
              width: 3 // Make shortest path edges thicker
            });
            pathNodeId = prevNodeId;
          } else {
            break;
          }
        }
      }
    }

    setHighlightedNodes(newHighlightedNodes);
    setHighlightedEdges(newHighlightedEdges);
  };

  useEffect(() => {
    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen transition-colors">
      <Header />
      <main className="flex-grow w-full flex items-center justify-center p-4">
        <div className="w-full max-w-7xl">
          <h1 className="text-4xl font-bold text-center mb-8">
            Dijkstra&apos;s Algorithm Visualizer
          </h1>
          <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-md">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold">Graph Visualization</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Drag nodes to rearrange the graph.
              </p>
            </div>
            <div className="p-4">
              <div ref={containerRef} className="w-full h-[600px]">
                {graph && 
                  <GraphVisualizer 
                    width={0} 
                    height={0} 
                    graph={graph} 
                    highlightedNodes={highlightedNodes}
                    highlightedEdges={highlightedEdges}
                    backgroundOptions={backgroundOptions}
                  />
                }
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex flex-col gap-4">
                {algorithmResult && (
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">
                      Step {currentStepIndex + 1} of {algorithmResult.steps.length}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 justify-center">
                  {!isRunning ? (
                    <button 
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      onClick={handleRunDijkstra}
                    >
                      Run Dijkstra&apos;s Algorithm
                    </button>
                  ) : (
                    <>
                      <button 
                        className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={handleStepBackward}
                        disabled={currentStepIndex <= 0}
                      >
                        Previous Step
                      </button>
                      <button 
                    className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    onClick={handleStepForward}
                    disabled={!!algorithmResult && currentStepIndex >= (algorithmResult.steps.length - 1)}
                  >
                    Next Step
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                          isAutoPlaying 
                            ? "bg-yellow-500 text-white hover:bg-yellow-600" 
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                    onClick={handleToggleAutoPlay}
                  >
                    {isAutoPlaying ? "Pause" : "Auto Play"}
                  </button>
                    </>
                  )}
                  <button 
                    className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    onClick={handleResetGraph}
                  >
                    Reset Graph
                  </button>
                  
                  {/* Graph & visualization configuration */}
                  <div className="flex flex-wrap gap-2 w-full mt-4 justify-center items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Density:</label>
                      <input 
                        type="number" 
                        value={graphDensity} 
                        onChange={(e) => setGraphDensity(Math.min(1, Math.max(0.05, Number(e.target.value))))} 
                        className="px-3 py-1 w-20 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        step="0.05"
                        min="0.05"
                        max="1"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Size:</label>
                      <input 
                        type="number"
                        value={graphSize}
                        onChange={(e) => setGraphSize(Math.min(100, Math.max(2, Number(e.target.value))))}
                        className="px-3 py-1 w-20 rounded-md border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                        min="2"
                        max="100"
                      />
                    </div>
                    
                    {/* Gradient toggle */}
                    <label className="flex items-center px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={useGradient}
                        onChange={(e) => setUseGradient(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Use Gradients</span>
                    </label>
                    
                    {/* Debug mode toggle */}
                    <label className="flex items-center px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={debug}
                        onChange={(e) => setDebug(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Debug Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DijkstrasPage;