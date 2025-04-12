import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

const DijkstrasDiagram = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const nodeControls = useAnimation();
  const edgeControls = useAnimation();
  const labelControls = useAnimation();

  // Function to reset and start animations on nodes, edges, and labels.
  const startAnimation = useCallback(() => {
    // Reset initial states
    nodeControls.set({ scale: 0 });
    edgeControls.set({ pathLength: 0 });
    labelControls.set({ opacity: 0 });

    // Animate edges using the "pathLength" property (ideal for drawing lines)
    edgeControls.start((i) => ({
      pathLength: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.6,
        ease: "easeInOut",
      },
    }));

    // Animate nodes scaling from 0 to 1
    nodeControls.start((i) => ({
      scale: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.6,
        ease: "easeInOut",
      },
    }));

    // Fade in text labels
    labelControls.start((i) => ({
      opacity: 1,
      transition: { delay: 0.3 + i * 0.15, duration: 0.3 },
    }));
  }, [nodeControls, edgeControls, labelControls]);

  // Detect dark mode
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    
    // Set initial value
    setIsDarkMode(darkModeMediaQuery.matches);
    
    // Listen for changes
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Trigger animation on first in-view
  useEffect(() => {
    if (isInView && !initialViewRef.current) {
      initialViewRef.current = true;
      startAnimation();
    }
  }, [isInView, startAnimation]);

  // Re-animate on hover (only on the transition from not-hovering to hovering)
  useEffect(() => {
    if (hoverState && !prevHoverState.current) {
      startAnimation();
    }
    prevHoverState.current = hoverState;
  }, [hoverState, startAnimation]);

  // Define nodes with positions (landscape orientation) and labels.
  // Layout adjusted for better visual spacing and approximate weight representation.
  const nodes = [
    { x: 60,  y: 150, label: "A" }, // Start node (Left side)
    { x: 200, y: 70,  label: "B" }, // Top-left area
    { x: 320, y: 180, label: "C" }, // Central area, slightly lower
    { x: 230, y: 260, label: "D" }, // Bottom-left area
    { x: 480, y: 240, label: "E" }, // Bottom-right area
    { x: 540, y: 150, label: "F" }, // End node (Right side)
  ];

  // Define weighted edges connecting the nodes.
  // Weights remain the same, visual distances are now more representative.
  const edges = [
    { start: 0, end: 1, weight: 7 },
    { start: 0, end: 2, weight: 9 },
    { start: 0, end: 5, weight: 14 },
    { start: 1, end: 2, weight: 10 },
    { start: 1, end: 3, weight: 15 },
    { start: 2, end: 3, weight: 11 },
    { start: 2, end: 5, weight: 2 },
    { start: 3, end: 4, weight: 6 },
    { start: 4, end: 5, weight: 9 },
  ];

  // Pre-computed shortest path for demonstration (A → C → F)
  // This path remains the shortest with the given weights.
  const shortestPathEdges = [
    { start: 0, end: 2 },
    { start: 2, end: 5 },
  ];

  // Define colors based on dark/light mode
  const colors = {
    background: isDarkMode ? 'rgba(10, 10, 10, 0.8)' : 'rgba(249, 250, 251, 0.8)',
    backgroundGradientStart: isDarkMode ? 'hsl(0, 0%, 12%)' : 'hsl(220, 13%, 95%)',
    backgroundGradientEnd: isDarkMode ? 'hsl(240, 87%, 30%)' : 'hsl(220, 13%, 90%)',
    nodeColor: isDarkMode ? 'hsl(217, 100%, 30%)' : 'hsl(210, 100%, 40%)',
    nodeStroke: isDarkMode ? 'hsl(217, 100%, 40%)' : 'hsl(210, 100%, 50%)',
    nodeTextColor: isDarkMode ? 'hsl(0, 0%, 100%)' : 'hsl(0, 0%, 100%)',
    edgeColor: isDarkMode ? 'hsl(0, 0%, 50%)' : 'hsl(0, 0%, 60%)',
    shortestPathColor: isDarkMode ? 'hsl(150, 100%, 40%)' : 'hsl(150, 100%, 35%)',
    startNodeColor: isDarkMode ? 'hsl(120, 100%, 35%)' : 'hsl(120, 100%, 40%)',
    weightTextColor: isDarkMode ? 'hsl(0, 0%, 70%)' : 'hsl(0, 0%, 40%)',
  };

  return (
    <div
      className="card"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        background: `linear-gradient(to bottom, ${colors.backgroundGradientStart}, ${colors.backgroundGradientEnd})`,
        padding: "8px",
        margin: "auto",
      }}
    >
      <motion.svg
        ref={ref}
        width="100%"
        height="100%"
        viewBox="0 0 600 300"
        onMouseEnter={() => setHoverState(true)}
        onMouseLeave={() => setHoverState(false)}
      >
        {/* Draw all edges */}
        {edges.map((edge, i) => {
          const startNode = nodes[edge.start];
          const endNode = nodes[edge.end];
          return (
            <motion.line
              key={`edge-${i}`}
              x1={startNode.x}
              y1={startNode.y}
              x2={endNode.x}
              y2={endNode.y}
              stroke={colors.edgeColor}
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              custom={i}
              animate={edgeControls}
            />
          );
        })}

        {/* Highlight the shortest path edges */}
        {shortestPathEdges.map((edge, i) => {
          const startNode = nodes[edge.start];
          const endNode = nodes[edge.end];
          return (
            <motion.line
              key={`shortest-${i}`}
              x1={startNode.x}
              y1={startNode.y}
              x2={endNode.x}
              y2={endNode.y}
              stroke={colors.shortestPathColor}
              strokeWidth={4}
              initial={{ pathLength: 0 }}
              custom={i}
              animate={edgeControls}
            />
          );
        })}

        {/* Animate nodes */}
        {nodes.map((node, i) => {
          // Use different colors for start node (A) and nodes on shortest path (C, F)
          const isStartNode = i === 0;
          const isOnShortestPath = i === 2 || i === 5;
          
          const nodeFill = isStartNode 
            ? colors.startNodeColor
            : isOnShortestPath
              ? colors.nodeColor 
              : isDarkMode ? 'hsl(217, 70%, 25%)' : 'hsl(210, 70%, 50%)';
              
          const nodeStroke = isStartNode 
            ? isDarkMode ? 'hsl(120, 100%, 45%)' : 'hsl(120, 100%, 50%)'
            : isOnShortestPath
              ? colors.nodeStroke
              : isDarkMode ? 'hsl(217, 70%, 35%)' : 'hsl(210, 70%, 60%)';
          
          return (
            <motion.circle
              key={`node-${i}`}
              cx={node.x}
              cy={node.y}
              r={20}
              fill={nodeFill}
              stroke={nodeStroke}
              strokeWidth={2}
              initial={{ scale: 0 }}
              custom={i}
              animate={nodeControls}
            />
          );
        })}

        {/* Animate node labels */}
        {nodes.map((node, i) => (
          <motion.text
            key={`label-${i}`}
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={colors.nodeTextColor}
            fontSize="14"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            custom={i}
            animate={labelControls}
          >
            {node.label}
          </motion.text>
        ))}
      </motion.svg>
    </div>
  );
};

export default DijkstrasDiagram;
