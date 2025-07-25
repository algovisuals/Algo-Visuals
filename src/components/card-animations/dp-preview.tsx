import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { computeShortestPath } from "@/algorithms-core/dynamic_common";

// DPPreview component for dynamic programming - completely redesigned
const DPPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [hoverState, setHoverState] = useState(false);
  const prevHoverState = useRef(false);
  const initialViewRef = useRef(false);

  const cellControls = useAnimation();
  const pathControls = useAnimation();
  const valueControls = useAnimation();

  // Simplified animation sequence
  const startAnimation = useCallback(async () => {
    // Reset animations
    cellControls.set({ opacity: 0 });
    pathControls.set({ opacity: 0, pathLength: 0 });
    valueControls.set({ opacity: 0 });

    // 1. Show grid
    await cellControls.start({
      opacity: 1,
      transition: { duration: 0.2, staggerChildren: 0.02 },
    });

    // 2. Show DP table values
    await valueControls.start((i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.08,
        duration: 0.3,
        ease: "easeOut",
      },
    }));

    // 3. Highlight optimal path
    await pathControls.start({
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut",
      },
    });
  }, [cellControls, pathControls, valueControls]);

  // Handle initial view and hover animations
  useEffect(() => {
    if (isInView && !initialViewRef.current) {
      initialViewRef.current = true;
      startAnimation();
    }
  }, [isInView, startAnimation]);

  useEffect(() => {
    if (hoverState && !prevHoverState.current) {
      startAnimation();
    }
    prevHoverState.current = hoverState;
  }, [hoverState, startAnimation]);

  // Grid dimensions
  const rows = 5;
  const cols = 5;
  const cellSize = 25;
  const spacing = 3;

  // DP table mock values (e.g., for a shortest path problem)
  const dpValues = [
    [0, 3, 6, 9, 10],
    [2, 4, 5, 8, 12],
    [5, 6, 7, 9, 14],
    [7, 8, 9, 11, 15],
    [9, 10, 12, 14, 16],
  ];

  // Compute the shortest path
  const optimalPath = computeShortestPath(dpValues);

  // Convert path to SVG path string
  const createPathString = () => {
    let pathString = "";
    optimalPath.forEach((point, i) => {
      const [row, col] = point;
      const x = 30 + col * (cellSize + spacing) + cellSize / 2;
      const y = 30 + row * (cellSize + spacing) + cellSize / 2;

      if (i === 0) {
        pathString += `M${x},${y} `;
      } else {
        pathString += `L${x},${y} `;
      }
    });
    return pathString;
  };

  return (
    <motion.svg
      ref={ref}
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      className="w-full h-full"
      onMouseEnter={() => setHoverState(true)}
      onMouseLeave={() => setHoverState(false)}
    >
      {/* Grid cells */}
      {Array.from({ length: rows * cols }).map((_, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x = 30 + col * (cellSize + spacing);
        const y = 30 + row * (cellSize + spacing);

        const isOnPath = optimalPath.some(([r, c]) => r === row && c === col);

        return (
          <motion.rect
            key={`cell-${index}`}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            rx={3}
            fill={isOnPath ? "#4B5563" : "#374151"}
            stroke="#9CA3AF"
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={cellControls}
            transition={{ delay: index * 0.01 }}
          />
        );
      })}

      {/* Cell values */}
      {dpValues.map((row, rowIndex) =>
        row.map((value, colIndex) => {
          const x = 30 + colIndex * (cellSize + spacing) + cellSize / 2;
          const y = 30 + rowIndex * (cellSize + spacing) + cellSize / 2;
          const index = rowIndex * cols + colIndex;

          return (
            <motion.text
              key={`value-${index}`}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#D1D5DB"
              fontSize="10"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              custom={index}
              animate={valueControls}
            >
              {value}
            </motion.text>
          );
        }),
      )}

      {/* Optimal path visualization */}
      <motion.path
        d={createPathString()}
        fill="none"
        stroke="#9CA3AF"
        strokeWidth={2}
        strokeDasharray="4 2"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={pathControls}
      />

      {/* Add arrowhead to path */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
        </marker>
      </defs>

      {/* Final arrowhead segment */}
      {optimalPath.length > 1 && (
        <motion.path
          d={(() => {
            const secondLast = optimalPath[optimalPath.length - 2];
            const last = optimalPath[optimalPath.length - 1];

            const x1 = 30 + secondLast[1] * (cellSize + spacing) + cellSize / 2;
            const y1 = 30 + secondLast[0] * (cellSize + spacing) + cellSize / 2;
            const x2 = 30 + last[1] * (cellSize + spacing) + cellSize / 2;
            const y2 = 30 + last[0] * (cellSize + spacing) + cellSize / 2;

            return `M${x1},${y1} L${x2},${y2}`;
          })()}
          stroke="#9CA3AF"
          strokeWidth={2}
          markerEnd="url(#arrowhead)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={pathControls}
        />
      )}
    </motion.svg>
  );
};

export default DPPreview;
