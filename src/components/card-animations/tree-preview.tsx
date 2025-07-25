import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

// TreePreview component for visualizing binary trees
const TreePreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);

  const nodeControls = useAnimation();
  const edgeControls = useAnimation();
  const labelControls = useAnimation();

  const startAnimation = useCallback(() => {
    // Reset animations first
    nodeControls.set({ scale: 0 });
    edgeControls.set({ pathLength: 0 });
    labelControls.set({ opacity: 0 });

    // Start animations
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
      transition: { delay: 0.4 + i * 0.15, duration: 0.3 },
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

  // Function to start the animation sequence

  // Tree node positions in binary tree layout
  const nodePositions = [
    { x: 150, y: 30 }, // Root node
    { x: 75, y: 70 }, // Left child
    { x: 225, y: 70 }, // Right child
    { x: 40, y: 110 }, // Left-left child
    { x: 110, y: 110 }, // Left-right child
    { x: 190, y: 110 }, // Right-left child
    { x: 260, y: 110 }, // Right-right child
  ];

  // Edge connections in tree (parent to child)
  const edges = [
    { start: 0, end: 1 }, // Root to left
    { start: 0, end: 2 }, // Root to right
    { start: 1, end: 3 }, // Left to left-left
    { start: 1, end: 4 }, // Left to left-right
    { start: 2, end: 5 }, // Right to right-left
    { start: 2, end: 6 }, // Right to right-right
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
          r={15}
          fill={i === 0 ? "#4B5563" : "#374151"}
          stroke="#9CA3AF"
          strokeWidth={2}
          initial={{ scale: 0 }}
          custom={i}
          animate={nodeControls}
        />
      ))}

      {/* Node labels */}
      {nodePositions.map((node, i) => (
        <motion.text
          key={`label-${i}`}
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#D1D5DB"
          fontSize="12"
          initial={{ opacity: 0 }}
          custom={i}
          animate={labelControls}
        >
          {String.fromCharCode(65 + i)}
        </motion.text>
      ))}
    </motion.svg>
  );
};

export default TreePreview;
