"use client";

import { useEffect, FC, useRef, useState } from "react";
import * as d3 from "d3";

interface ArrayBaseProps {
  array: number[];
  pivotIndex?: number;
  comparing?: number[];
}

const ArrayBase: FC<ArrayBaseProps> = ({ array, pivotIndex, comparing }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(200, containerRef.current.clientHeight), // Minimum height of 200px
        });
      }
    };

    // Initial dimensions
    updateDimensions();

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || array.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Fixed box and spacing configuration
    const boxSize = 50; // Fixed box size
    const maxBoxPerRow = 15;
    const spacing = 10; // Fixed spacing between boxes

    // How many boxes fit in a row (limited by maxBoxPerRow)
    const boxesPerRow = Math.min(
      Math.floor((dimensions.width + spacing) / (boxSize + spacing)),
      maxBoxPerRow,
      array.length, // Don't use more boxes per row than we have elements
    );

    // Calculate required rows
    const rows = Math.ceil(array.length / boxesPerRow);

    // Calculate exact width needed for the current number of boxes per row
    const rowWidth = Math.min(
      boxesPerRow * (boxSize + spacing) + spacing,
      array.length * (boxSize + spacing) + spacing,
    );

    // Calculate total height needed for all rows
    const totalHeight = rows * (boxSize + spacing) + spacing;

    // Set SVG dimensions to exactly what we need
    svg.attr("width", rowWidth).attr("height", totalHeight);

    // Draw array boxes
    svg
      .selectAll(".array-box")
      .data(array)
      .enter()
      .append("rect")
      .attr("class", "array-box")
      .attr("x", (d, i) => {
        const col = i % boxesPerRow;
        return col * (boxSize + spacing) + spacing;
      })
      .attr("y", (d, i) => {
        const row = Math.floor(i / boxesPerRow);
        return row * (boxSize + spacing) + spacing;
      })
      .attr("width", boxSize)
      .attr("height", boxSize)
      .attr("stroke", "black")
      .attr("fill", (d, i) => {
        if (pivotIndex !== undefined && i === pivotIndex) return "red";
        if (comparing && comparing.includes(i)) return "orange";
        return "white";
      })
      .attr("rx", 10);

    // Draw array values inside boxes
    svg
      .selectAll(".array-value")
      .data(array)
      .enter()
      .append("text")
      .attr("class", "array-value")
      .attr("x", (d, i) => {
        const col = i % boxesPerRow;
        return col * (boxSize + spacing) + spacing + boxSize / 2;
      })
      .attr("y", (d, i) => {
        const row = Math.floor(i / boxesPerRow);
        return row * (boxSize + spacing) + spacing + boxSize / 2 + 5;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text((d) => d);
  }, [array, comparing, pivotIndex, dimensions]); // Re-run if the array or dimensions change

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center w-full h-full"
    >
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  );
};

export default ArrayBase;
