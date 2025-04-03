"use client";

import React, { useState, FC, useRef, useEffect } from "react";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { dijkstra, DijkstraStep, DijkstraResult } from "@/algorithms-core/dijkstras";

import { 
  generateRandomGraph, 
  addNeighbors, 
  createConnectedGraph, 
  GraphVisualizer, 
  GraphVisualizerProps,
  NodeHighlight,
  EdgeHighlight 
} from "@/algorithms-core/graphs_common";

const DijkstrasPage: FC = () => {
  const [graphData, setGraphData] = useState<GraphVisualizerProps["data"]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<NodeHighlight[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<EdgeHighlight[]>([]);
  const [startNodeId, setStartNodeId] = useState<string | null>(null);
  const [endNodeId, setEndNodeId] = useState<string | null>(null);
  const [algorithmResult, setAlgorithmResult] = useState<DijkstraResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize graph
  useEffect(() => {
    // Create a larger graph with more connections for better visualization
    const nodes = generateRandomGraph(10, 1, 10); // Use smaller weights (1-5) for better paths
    createConnectedGraph(nodes);
    
    // Debug the graph
    console.log("Generated graph with", nodes.length, "nodes");
    nodes.forEach(node => {
      console.log(`Node ${node.id} has ${node.neighbors.length} neighbors: ${node.neighbors.map(n => n.id).join(', ')}`);
    });
    
    setGraphData(nodes);
    
    if (nodes.length > 0) {
      // Try to select nodes that are far apart
      const startIndex = 0;
      const endIndex = nodes.length - 1;
      
      setStartNodeId(nodes[startIndex].id);
      setEndNodeId(nodes[endIndex].id);
      
      // Highlight start and end nodes
      setHighlightedNodes([
        { nodeId: nodes[startIndex].id, color: 'hsl(120, 100%, 40%)' }, // Start node (green)
        { nodeId: nodes[endIndex].id, color: 'hsl(0, 100%, 50%)' }      // End node (red)
      ]);
    }
  }, []);

  // Run Dijkstra's algorithm
  const handleRunDijkstra = () => {
    if (!startNodeId || !endNodeId || graphData.length === 0) {
      console.error("Missing start or end node, or no graph data");
      return;
    }
    
    // Log the graph for debugging
    console.log("Graph data:", graphData);
    console.log("Start node:", startNodeId, "End node:", endNodeId);
    
    try {
      // Create more connected graph for better visualizations
      const nodes = [...graphData];
      // Ensure enough edges by adding more neighbors if needed
      addNeighbors(nodes, 1, 1);
      
      // Run Dijkstra's algorithm
      const result = dijkstra(nodes, startNodeId, endNodeId);
      console.log("Algorithm result - number of steps:", result.steps.length);
      console.log("Shortest path:", result.shortestPath);
      console.log("Total distance:", result.totalDistance);
      
      setGraphData(nodes);
      setAlgorithmResult(result);
      setCurrentStepIndex(0);
      setIsRunning(true);
      
      // Pass the result directly to the visualization function
      updateVisualization(result.steps[0], result);
    } catch (error) {
      console.error("Error running Dijkstra's algorithm:", error);
    }
  };

  // Reset the graph and algorithm state
  const handleResetGraph = () => {
    // Stop auto-play if running
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
      setIsAutoPlaying(false);
    }
    
    setIsRunning(false);
    setCurrentStepIndex(0);
    setAlgorithmResult(null);
    
    // Generate a new graph
    const nodes = generateRandomGraph(10, 1, 10); 
    createConnectedGraph(nodes);
    setGraphData(nodes);
    
    if (nodes.length > 0) {
      // Set random start and end nodes
      const startIndex = Math.floor(Math.random() * nodes.length);
      let endIndex;
      do {
        endIndex = Math.floor(Math.random() * nodes.length);
      } while (endIndex === startIndex);
      
      setStartNodeId(nodes[startIndex].id);
      setEndNodeId(nodes[endIndex].id);
      
      // Highlight start and end nodes
      setHighlightedNodes([
        { nodeId: nodes[startIndex].id, color: 'hsl(120, 100%, 40%)' }, // Start node (green)
        { nodeId: nodes[endIndex].id, color: 'hsl(0, 100%, 50%)' }      // End node (red)
      ]);
      
      setHighlightedEdges([]);
    }
  };

  // Toggle auto-play for the algorithm
  const handleToggleAutoPlay = () => {
    if (!algorithmResult) return;
    
    // If already auto-playing, stop it
    if (isAutoPlaying) {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
        autoPlayIntervalRef.current = null;
      }
      setIsAutoPlaying(false);
      return;
    }
    
    // Start auto-play
    setIsAutoPlaying(true);
    
    // Handle case where we're at the end already
    if (currentStepIndex >= algorithmResult.steps.length - 1) {
      setCurrentStepIndex(0);
      updateVisualization(algorithmResult.steps[0], algorithmResult);
    }
    
    autoPlayIntervalRef.current = setInterval(() => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        // If we've reached the end, stop auto-play
        if (nextIndex >= algorithmResult.steps.length) {
          if (autoPlayIntervalRef.current) {
            clearInterval(autoPlayIntervalRef.current);
            autoPlayIntervalRef.current = null;
          }
          setIsAutoPlaying(false);
          return prevIndex;
        }
        
        // Update visualization with the next step
        updateVisualization(algorithmResult.steps[nextIndex], algorithmResult);
        return nextIndex;
      });
    }, 750); // Adjust speed here
  };

  // Step forward in the algorithm
  const handleStepForward = () => {
    if (!algorithmResult || currentStepIndex >= algorithmResult.steps.length - 1) return;
    
    const nextStepIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextStepIndex);
    updateVisualization(algorithmResult.steps[nextStepIndex], algorithmResult);
  };

  // Step backward in the algorithm
  const handleStepBackward = () => {
    if (!algorithmResult || currentStepIndex <= 0) return;
    
    const prevStepIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevStepIndex);
    updateVisualization(algorithmResult.steps[prevStepIndex], algorithmResult);
  };

  // Update visualization based on the current algorithm step
  const updateVisualization = (step: DijkstraStep, resultToUse?: DijkstraResult) => {
    const result = resultToUse || algorithmResult;
    
    if (!startNodeId || !endNodeId || !result) {
      console.error("Cannot update visualization: missing data");
      return;
    }
    
    console.log("Updating visualization for step:", currentStepIndex);
    console.log("Current step data:", {
      currentNodeId: step.currentNodeId,
      visitedCount: step.visited.size,
      unvisitedCount: step.unvisited.size
    });
    
    const newHighlightedNodes: NodeHighlight[] = [];
    const newHighlightedEdges: EdgeHighlight[] = [];
    
    // Always highlight start and end nodes
    newHighlightedNodes.push(
      { nodeId: startNodeId, color: 'hsl(120, 100%, 40%)' }, // Start node (green)
      { nodeId: endNodeId, color: 'hsl(0, 100%, 50%)' }      // End node (red)
    );
    
    // Highlight the current node being processed using a border.
    if (step.currentNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentNodeId,
        color: 'hsl(270, 100%, 70%)', // Purple color instead of transparent
        border: '2px solid purple' // Border highlight for current node.
      } as any);
    }
    
    // Visited nodes in blue
    step.visited.forEach(nodeId => {
      if (nodeId !== startNodeId && nodeId !== endNodeId && nodeId !== step.currentNodeId) {
        newHighlightedNodes.push({
          nodeId,
          color: 'hsl(210, 100%, 50%)' // Blue for visited nodes.
        });
      }
    });
    
    // Next shortest (unvisited) node in yellow
    if (step.currentShortest && step.currentShortest !== startNodeId && step.currentShortest !== endNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentShortest,
        color: 'hsl(45, 100%, 50%)' // Yellow for next shortest node.
      });
    }
    
    // Show gold shortest path only on the final step
    if (result.shortestPath && currentStepIndex === result.steps.length - 1) {
      const path = result.shortestPath;
      // Intermediate nodes shown in gold
      for (let i = 1; i < path.length - 1; i++) {
        if (!newHighlightedNodes.some(hl => hl.nodeId === path[i])) {
          newHighlightedNodes.push({
            nodeId: path[i],
            color: 'gold'
          });
        }
      }
      // Processed edges in gold
      for (let i = 0; i < path.length - 1; i++) {
        newHighlightedEdges.push({
          sourceId: path[i],
          targetId: path[i + 1],
          color: 'gold'
        });
      }
    } else {
      // Processed edges (relaxed in current step) shown in blue.
      step.visited.forEach(nodeId => {
        const prevNodeId = step.previous.get(nodeId);
        if (prevNodeId) {
          newHighlightedEdges.push({
            sourceId: prevNodeId,
            targetId: nodeId,
            color: 'hsl(210, 100%, 50%)'
          });
        }
      });
    }
    
    setHighlightedNodes(newHighlightedNodes);
    setHighlightedEdges(newHighlightedEdges);
  };

  // Clean up auto-play interval on component unmount
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
          <h1 className="text-4xl font-bold text-center mb-8">Dijkstra's Algorithm Visualizer</h1>
          
          <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-md">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold">Graph Visualization</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Drag nodes to rearrange the graph. Node values represent edge weights.
              </p>
            </div>
            
            <div className="p-4">
              <div ref={containerRef} className="w-full h-[600px]">
                <GraphVisualizer 
                  width={0} 
                  height={0} 
                  data={graphData} 
                  highlightedNodes={highlightedNodes}
                  highlightedEdges={highlightedEdges}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex flex-col gap-4">
                {algorithmResult && (
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">
                      Step {currentStepIndex + 1} of {algorithmResult.steps.length}
                    </p>
                    {algorithmResult.shortestPath && currentStepIndex === algorithmResult.steps.length - 1 && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        Shortest path length: {algorithmResult.totalDistance}
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {!isRunning ? (
                    <button 
                      className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                      onClick={handleRunDijkstra}
                    >
                      Run Dijkstra's Algorithm
                    </button>
                  ) : (
                    <>
                      <button 
                        className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                        onClick={handleStepBackward}
                        disabled={currentStepIndex <= 0}
                      >
                        Previous Step
                      </button>
                      
                      <button 
                        className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                        onClick={handleStepForward}
                        disabled={currentStepIndex >= (algorithmResult?.steps.length || 0) - 1}
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
                    className="px-4 py-2 rounded-md bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    onClick={handleResetGraph}
                  >
                    Reset Graph
                  </button>
                </div>
                
                {algorithmResult && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-2 text-sm">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[hsl(120,100%,40%)] mr-2"></span>
                      <span>Start Node</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[hsl(0,100%,50%)] mr-2"></span>
                      <span>End Node</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[hsl(210,100%,50%)] mr-2"></span>
                      <span>Visited Nodes</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[hsl(45,100%,50%)] mr-2"></span>
                      <span>Shortest Path</span>
                    </div>
                  </div>
                )}
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