import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

const ArrayPreview = () => {
  // Values for the array elements (heights will be proportional to these)
  const values = [35, 15, 50, 25, 80, 65, 40];
  
  // Calculate the width of each bar based on the number of elements
  const barWidth = 280 / values.length;
  const maxValue = Math.max(...values);
  const barSpacing = 4;
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);
  
  const barControls = useAnimation();
  const labelControls = useAnimation();
  const containerControls = useAnimation();
  
  const [highlightIndex, setHighlightIndex] = useState(-1);

  // Function to start the animation sequence
  const startAnimation = useCallback(() => {
    // Reset animations first
    barControls.set({ scaleY: 0, opacity: 0 });
    labelControls.set({ opacity: 0 });
    containerControls.set({ opacity: 0 });
    setHighlightIndex(-1); // Reset highlight index
    
    // Start animations
    containerControls.start({
      opacity: 0.6,
      transition: { delay: 0.2 }
    });
    
    barControls.start(i => ({
      scaleY: 1,
      opacity: 1,
      transition: {
        delay: 0.3 + (i * 0.1),
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }));
    
    labelControls.start(i => ({
      opacity: 1,
      transition: { delay: 0.8 + (i * 0.1) }
    }));
    
    // Start highlight animation after a delay
    setTimeout(() => {
      // Sequence through highlighting each bar
      const indices = [0, 1, 2, 3, 4, 5, 6];
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        setHighlightIndex(indices[currentIndex]);
        currentIndex++;
        
        if (currentIndex >= indices.length) {
          clearInterval(interval);
          // Clear highlight after completing
          setTimeout(() => {
            setHighlightIndex(-1);
          }, 300);
        }
      }, 300); // Time between highlights
    }, 1000);
  }, [barControls, labelControls, containerControls, setHighlightIndex]);
  
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
  
  return (
    <motion.svg 
      ref={ref}
      width="100%" 
      height="150" 
      viewBox="0 0 300 150"
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
    >
      {/* Array container outline */}
      <motion.rect
        x="10"
        y="20"
        width="280"
        height="100"
        rx="3"
        fill="transparent"
        stroke="#4B5563"
        strokeWidth="2"
        strokeDasharray="4 2"
        initial={{ opacity: 0 }}
        animate={containerControls}
      />
      
      {/* Array elements */}
      {values.map((value, i) => {
        // Calculate height based on value
        const height = (value / maxValue) * 80;
        // Calculate x position
        const x = 10 + (i * (barWidth));
        
        return (
          <motion.rect
            key={i}
            x={x + barSpacing/2}
            y={120 - height}
            width={barWidth - barSpacing}
            height={height}
            fill="#4B5563"
            stroke={highlightIndex === i ? "#EF4444" : "#9CA3AF"}
            strokeWidth={highlightIndex === i ? 3 : 1}
            initial={{ scaleY: 0, opacity: 0 }}
            custom={i}
            animate={barControls}
          />
        );
      })}
      
      {/* Index labels */}
      {values.map((_, i) => (
        <motion.text
          key={`idx-${i}`}
          x={10 + (i * barWidth) + (barWidth/2)}
          y="140"
          textAnchor="middle"
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

export default ArrayPreview;