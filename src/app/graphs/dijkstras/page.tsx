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

// Helper function for conditional debug logging
function debugLog(debug: boolean, ...args: any[]): void {
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
  const [graphSize, setGraphSize] = useState<number>(20);
  const [debug, setDebug] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  // Initialize graph on mount with the correct dependencies
  useEffect(() => {
    const newGraph = createRandomGraph(graphSize, graphDensity);
    setGraph(newGraph);
    // Set start node from the available node keys
    const nodeIds = Object.keys(newGraph.nodes);
    if (nodeIds.length > 0) {
      setStartNodeId(nodeIds[0]);
      setHighlightedNodes([
        { nodeId: nodeIds[0], color: "hsl(120,100%,40%)" } // Start (green)
      ]);
    }
  }, [graphSize, graphDensity]);

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

  const handleResetGraph = () => {
    if (autoPlayIntervalRef.current) {
      clearInterval(autoPlayIntervalRef.current);
      autoPlayIntervalRef.current = null;
      setIsAutoPlaying(false);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
    setAlgorithmResult(null);

    const newGraph = createRandomGraph(graphSize, graphDensity);
    setGraph(newGraph);
    const nodeIds = Object.keys(newGraph.nodes);
    if (nodeIds.length > 0) {
      setStartNodeId(nodeIds[0]);
      setHighlightedNodes([
        { nodeId: nodeIds[0], color: "hsl(120,100%,40%)" }
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
    if (!startNodeId || !result) {
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

    // Always highlight the start node.
    newHighlightedNodes.push({ nodeId: startNodeId, color: "hsl(120,100%,40%)" });

    // Highlight current processing node.
    if (step.currentNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentNodeId,
        color: "hsl(270,100%,70%)"
      });
    }

    // Mark visited nodes in blue.
    step.visited.forEach(nodeId => {
      if (nodeId !== startNodeId && nodeId !== step.currentNodeId) {
        newHighlightedNodes.push({
          nodeId,
          color: "hsl(210,100%,50%)"
        });
      }
    });

    // Highlight next shortest (unvisited) node in yellow.
    if (step.currentShortest && step.currentShortest !== startNodeId) {
      newHighlightedNodes.push({
        nodeId: step.currentShortest,
        color: "hsl(45,100%,50%)"
      });
    }

    // If the shortest path has been reconstructed on the final step, highlight that path in gold.
    if (result.shortestPath && currentStepIndex === result.steps.length - 1) {
      const path = result.shortestPath;
      for (let i = 1; i < path.length; i++) {
        newHighlightedEdges.push({
          sourceId: path[i - 1],
          targetId: path[i],
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
          <h1 className="text-4xl font-bold text-center mb-8">
            Dijkstra&apos;s Algorithm Visualizer
          </h1>
          <div className="rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-md">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-semibold">Graph Visualization</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                  {/* Graph configuration inputs */}
                  <input 
                    type="number" 
                    value={graphDensity || ""} 
                    onChange={(e) => setGraphDensity(Number(e.target.value))} 
                    placeholder="Enter Graph Density" 
                    className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    step="0.1"
                    max={1}
                  />
                  <input 
                    type="number"
                    value={graphSize || ""}
                    onChange={(e) => setGraphSize(Number(e.target.value))}
                    placeholder="Enter Graph Size"
                    className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    min={2}
                    max={100}
                  />
                  {/* Debug mode toggle */}
                  <label className="flex items-center px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={debug}
                      onChange={(e) => setDebug(e.target.checked)}
                      className="mr-2"
                    />
                    Debug Mode
                  </label>
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