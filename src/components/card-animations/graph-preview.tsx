import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

// GraphPreview component updated to animate ONLY on initial view and hover start
const GraphPreview = () => {
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
    
    // Start animations - improved with easeInOut for paths
    edgeControls.start(i => ({
      pathLength: 1,
      transition: { 
        delay: 0.3 + (i * 0.1), 
        duration: 0.6,
        ease: "easeInOut" 
      }
    }));
    
    nodeControls.start(i => ({
      scale: 1,
      transition: { 
        delay: 0.3 + (i * 0.1), 
        duration: 0.6,
        ease: "easeInOut" 
      }
    }));
    
    labelControls.start(i => ({
      opacity: 1,
      transition: { delay: i * 0.15 + 0.3, duration: 0.3 }
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
    // Only trigger animation when hover STARTS (false -> true transition)
    if (hoverState && !prevHoverState.current) {
      startAnimation();
    }
    
    // Update previous hover state
    prevHoverState.current = hoverState;
  }, [hoverState, startAnimation]);
  
  // Random but nicely distributed positions for 6 nodes
  const nodePositions = [
    { x: 40, y: 20 },
    { x: 123, y: 30 },
    { x: 50, y: 64 },
    { x: 169, y: 125 },
    { x: 240, y: 115 },
    { x: 200, y: 31 }
  ];

  // Edge connections between nodes
  const edges = [
    { start: 0, end: 1 },
    { start: 1, end: 2 },
    { start: 1, end: 3 },
    { start: 3, end: 4 },
    { start: 2, end: 3 },
    { start: 4, end: 5 }
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
          fill="#374151"
          stroke="#9CA3AF"
          strokeWidth={2}
          initial={{ scale: 0 }}
          custom={i}
          animate={nodeControls}
        />
      ))}

      {/* Optional: Add node labels */}
      {nodePositions.map((node, i) => (
        <motion.text
          key={`label-${i}`}
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#9CA3AF"
          fontSize="12"
          initial={{ opacity: 0 }}
          custom={i}
          animate={labelControls}
        >
          {i}
        </motion.text>
      ))}
    </motion.svg>
  );
};

export default GraphPreview;