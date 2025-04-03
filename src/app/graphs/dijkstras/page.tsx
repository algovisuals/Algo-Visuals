"use client";

import React, { useState, FC, useRef, useEffect } from "react";

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

const DijkstrasPage: FC = () => {
  const [graph, setGraph] = useState<Graph | null>(null);
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

  // Initialize graph on mount
  useEffect(() => {
    const newGraph = createRandomGraph(10, 1, 10);
    setGraph(newGraph);
    // Set start and end from the available node keys
    const nodeIds = Object.keys(newGraph.nodes);
    if (nodeIds.length > 0) {
      setStartNodeId(nodeIds[0]);
      setEndNodeId(nodeIds[nodeIds.length - 1]);
      setHighlightedNodes([
        { nodeId: nodeIds[0], color: "hsl(120,100%,40%)" }, // Start (green)
        { nodeId: nodeIds[nodeIds.length - 1], color: "hsl(0,100%,50%)" } // End (red)
      ]);
    }
  }, []);

  const handleRunDijkstra = () => {
    if (!startNodeId || !endNodeId || !graph) {
      console.error("Missing start or end node, or no graph");
      return;
    }

    try {
      const result = dijkstra(graph, startNodeId);
      console.log("Dijkstra algorithm completed. Steps:", result.steps.length);
      setAlgorithmResult(result);
      setCurrentStepIndex(0);
      setIsRunning(true);
      updateVisualization(result.steps[0], result);
    } catch (error) {
      console.error("Error running Dijkstra's algorithm:", error);
    }
  };

  const handleResetGraph = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
      setIsAutoPlaying(false);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
    setAlgorithmResult(null);

    const newGraph = createRandomGraph(10, 1, 10);
    setGraph(newGraph);
    const nodeIds = Object.keys(newGraph.nodes);
    if (nodeIds.length > 0) {
      setStartNodeId(nodeIds[0]);
      setEndNodeId(nodeIds[nodeIds.length - 1]);
      setHighlightedNodes([
        { nodeId: nodeIds[0], color: "hsl(120,100%,40%)" },
        { nodeId: nodeIds[nodeIds.length - 1], color: "hsl(0,100%,50%)" }
      ]);
      setHighlightedEdges([]);
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
    if (!startNodeId || !endNodeId || !result) {
      console.error("Cannot update visualization: missing data");
      return;
    }

    console.log("Updating visualization for step:", currentStepIndex);
    console.log("Step data:", {
      currentNodeId: step.currentNodeId,
      visitedCount: step.visited.size,
      unvisitedCount: step.unvisited.size
    });

    const newHighlightedNodes: NodeHighlight[] = [];
    const newHighlightedEdges: EdgeHighlight[] = [];

    // Always highlight start and end nodes.
    newHighlightedNodes.push(
      { nodeId: startNodeId, color: "hsl(120,100%,40%)" },
      { nodeId: endNodeId, color: "hsl(0,100%,50%)" }
    );

    // Highlight current processing node.
    if (step.currentNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentNodeId,
        color: "hsl(270,100%,70%)"
      });
    }

    // Mark visited nodes in blue.
    step.visited.forEach(nodeId => {
      if (nodeId !== startNodeId && nodeId !== endNodeId && nodeId !== step.currentNodeId) {
        newHighlightedNodes.push({
          nodeId,
          color: "hsl(210,100%,50%)"
        });
      }
    });

    // Highlight next shortest (unvisited) node in yellow.
    if (step.currentShortest && step.currentShortest !== startNodeId && step.currentShortest !== endNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentShortest,
        color: "hsl(45,100%,50%)"
      });
    }

    // If the shortest path has been reconstructed on the final step, highlight that path in gold.
    if (result.shortestPath && currentStepIndex === result.steps.length - 1) {
      const path = result.shortestPath;
      for (let i = 1; i < path.length - 1; i++) {
        if (!newHighlightedNodes.some(hl => hl.nodeId === path[i])) {
          newHighlightedNodes.push({
            nodeId: path[i],
            color: "gold"
          });
        }
      }
      for (let i = 0; i < path.length - 1; i++) {
        newHighlightedEdges.push({
          sourceId: path[i],
          targetId: path[i + 1],
          color: "gold"
        });
      }
    } else {
      // Otherwise, add edges representing the relaxed paths.
      step.visited.forEach(nodeId => {
        const prevNodeId = step.previous.get(nodeId);
        if (prevNodeId) {
          newHighlightedEdges.push({
            sourceId: prevNodeId,
            targetId: nodeId,
            color: "hsl(210,100%,50%)"
          });
        }
      });
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
                {graph && 
                  <GraphVisualizer 
                    width={0} 
                    height={0} 
                    graph={graph} 
                    highlightedNodes={highlightedNodes}
                    highlightedEdges={highlightedEdges}
                  />
                }
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
                        Shortest Path Length: {algorithmResult.totalDistance}
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