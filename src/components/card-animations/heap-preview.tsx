import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

// HeapPreview component for visualizing heaps
const HeapPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);

  const nodeControls = useAnimation();
  const edgeControls = useAnimation();
  const labelControls = useAnimation();

  // Function to start the animation sequence
  const startAnimation = useCallback(() => {
    // Reset animations first
    nodeControls.set({ scale: 0 });
    edgeControls.set({ pathLength: 0 });
    labelControls.set({ opacity: 0 });

    // Start animations with improved settings
    edgeControls.start((i) => ({
      pathLength: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.6,
        ease: "easeInOut",
      },
    }));

    nodeControls.start((i) => ({
      scale: 1,
      transition: {
        delay: 0.3 + i * 0.1,
        duration: 0.6,
        ease: "easeInOut",
      },
    }));

    labelControls.start((i) => ({
      opacity: 1,
      transition: { delay: 0.1 + i * 0.15, duration: 0.3 },
    }));
  }, [nodeControls, edgeControls, labelControls]);

  // Handle initial view animation
  useEffect(() => {
    if (isInView && !initialViewRef.current) {
      initialViewRef.current = true;
      startAnimation();
    }
  }, [isInView, startAnimation]);

  // Handle hover state changes
  useEffect(() => {
    if (hoverState && !prevHoverState.current) {
      startAnimation();
    }
    prevHoverState.current = hoverState;
  }, [hoverState, startAnimation]);

  // Heap node positions (max heap)
  const nodePositions = [
    { x: 150, y: 30 }, // Root (0)
    { x: 75, y: 70 }, // Left child (1)
    { x: 225, y: 70 }, // Right child (2)
    { x: 40, y: 110 }, // Left grandchild (3)
    { x: 110, y: 110 }, // Right grandchild (4)
    { x: 190, y: 110 }, // Left grandchild (5)
    { x: 260, y: 110 }, // Right grandchild (6)
  ];

  // Node values (representing a max heap)
  const nodeValues = [99, 50, 80, 20, 30, 60, 10];

  // Edge connections
  const edges = [
    { start: 0, end: 1 }, // Root to left
    { start: 0, end: 2 }, // Root to right
    { start: 1, end: 3 }, // Level 1 left to its left child
    { start: 1, end: 4 }, // Level 1 left to its right child
    { start: 2, end: 5 }, // Level 1 right to its left child
    { start: 2, end: 6 }, // Level 1 right to its right child
  ];

  return (
    <motion.svg
      ref={ref}
      width="100%"
      height="100%"
      viewBox="0 0 300 150"
      className="w-full h-full"
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
    >
      {/* Edges */}
      {edges.map((edge, i) => {
        const startNode = nodePositions[edge.start];
        const endNode = nodePositions[edge.end];

        return (
          <motion.line
            key={`edge-${i}`}
            x1={startNode.x}
            y1={startNode.y}
            x2={endNode.x}
            y2={endNode.y}
            stroke="#9CA3AF"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            custom={i}
            animate={edgeControls}
          />
        );
      })}

      {/* Nodes */}
      {nodePositions.map((node, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={node.x}
          cy={node.y}
          r={18}
          fill={i === 0 ? "#4B5563" : "#374151"}
          stroke="#9CA3AF"
          strokeWidth={2}
          initial={{ scale: 0 }}
          custom={i}
          animate={nodeControls}
        />
      ))}

      {/* Node labels (values) */}
      {nodePositions.map((node, i) => (
        <motion.text
          key={`label-${i}`}
          x={node.x}
          y={node.y + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#D1D5DB"
          fontSize={nodeValues[i] >= 100 ? "10" : "12"}
          fontWeight="bold"
          initial={{ opacity: 0 }}
          custom={i}
          animate={labelControls}
        >
          {nodeValues[i]}
        </motion.text>
      ))}
    </motion.svg>
  );
};

export default HeapPreview;
