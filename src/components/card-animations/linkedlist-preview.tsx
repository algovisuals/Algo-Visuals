import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

// LinkedListPreview component for visualizing linked lists
const LinkedListPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);
  
  const nodeControls = useAnimation();
  const arrowControls = useAnimation();
  const labelControls = useAnimation();

  // Function to start the animation sequence
  const startAnimation = useCallback(() => {
    // Reset animations first
    nodeControls.set({ scale: 0 });
    arrowControls.set({ pathLength: 0 });
    labelControls.set({ opacity: 0 });
    
    // Start animations with improved settings
    nodeControls.start(i => ({
      scale: 1,
      transition: { 
        delay: 0.3 + (i * 0.1), 
        duration: 0.6,
        ease: "easeInOut" 
      }
    }));
    
    arrowControls.start(i => ({
      pathLength: 1,
      transition: { 
        delay: 0.3 + (i * 0.1), 
        duration: 0.6,
        ease: "easeInOut"
      }
    }));
    
    labelControls.start(i => ({
      opacity: 1,
      transition: { delay: 0.3 + (i * 0.15), duration: 0.3 }
    }));
  }, [nodeControls, arrowControls, labelControls]);
  
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
  
  
  // Positions for linked list nodes (horizontal alignment)
  const nodePositions = [
    { x: 50, y: 75 },
    { x: 125, y: 75 },
    { x: 200, y: 75 },
    { x: 275, y: 75 }
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
      {/* Nodes */}
      {nodePositions.map((node, i) => (
        <motion.rect 
          key={`node-${i}`}
          x={node.x - 20} 
          y={node.y - 20} 
          width={40} 
          height={40}
          rx={5}
          fill="#374151"
          stroke="#9CA3AF"
          strokeWidth={2}
          initial={{ scale: 0 }}
          custom={i}
          animate={nodeControls}
        />
      ))}
      
      {/* Arrows between nodes */}
      {nodePositions.slice(0, -1).map((node, i) => {
        const nextNode = nodePositions[i + 1];
        return (
          <motion.line
            key={`arrow-${i}`}
            x1={node.x + 25} 
            y1={node.y}
            x2={nextNode.x - 25} 
            y2={nextNode.y}
            stroke="#9CA3AF"
            strokeWidth={2}
            initial={{ pathLength: 0 }}
            custom={i}
            animate={arrowControls}
          />
        );
      })}
      
      {/* Arrow heads */}
      {nodePositions.slice(0, -1).map((node, i) => {
        const nextNode = nodePositions[i + 1];
        return (
          <motion.polygon
            key={`arrowhead-${i}`}
            points={`${nextNode.x - 25},${nextNode.y} ${nextNode.x - 35},${nextNode.y - 5} ${nextNode.x - 35},${nextNode.y + 5}`}
            fill="#9CA3AF"
            initial={{ opacity: 0 }}
            custom={i}
            animate={arrowControls}
          />
        );
      })}
      
      {/* Labels */}
      {nodePositions.map((node, i) => (
        <motion.text
          key={`label-${i}`}
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#D1D5DB"
          fontSize="14"
          fontWeight="bold"
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

export default LinkedListPreview;