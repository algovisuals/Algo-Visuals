import * as d3 from "d3";
import { FC, useEffect, useRef } from "react";
import { SortStep } from "@/algorithms-core/quicksort"

export function generateRandomArray(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () =>
    Math.floor(Math.random() * (max - min + 1)) + min
  );
}


export interface ArrayVisualizerProps {
  step: SortStep;
}

/**
 * ArrayVisualizer component for visualizing sorting steps.
 * 
 * @param param0 - Contains the sorting step data.
 * @returns JSX.Element
 */

export const ArrayVisualizer: FC<ArrayVisualizerProps> = ({ step }) => {
  const { arr, pivotIndex, comparing } = step;
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;

    let g = svg.select<SVGGElement>("g");
    if (g.empty()) {
      g = svg.append<SVGGElement>("g");
    }

    // Set up zoom behavior.
    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 5])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        })
    );

    const barWidth = width / arr.length;
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(arr) || 100])
      .range([height, 0]);

    // DATA JOIN: Bind array data to rect elements.
    const bars = g.selectAll<SVGRectElement, number>("rect").data(arr);

    // ENTER: Append new bars.
    bars.enter()
      .append("rect")
      .attr("x", (_, i) => i * barWidth)
      .attr("y", height)
      .attr("width", barWidth - 5)
      .attr("height", 0)
      .attr("fill", "steelblue")
      .attr("stroke", (d, i) => {
        if (pivotIndex !== undefined && i === pivotIndex) return "red";
        if (comparing && comparing.includes(i)) return "orange";
        return "none";
      })
      .attr("stroke-width", (d, i) => {
        if ((pivotIndex !== undefined && i === pivotIndex) || (comparing && comparing.includes(i)))
          return 3;
        return 0;
      })
      .transition()
      .duration(500)
      .attr("y", (d) => yScale(d))
      .attr("height", (d) => height - yScale(d));

    // UPDATE: Update existing bars.
    bars.transition()
      .duration(500)
      .attr("x", (_, i) => i * barWidth)
      .attr("width", barWidth - 5)
      .attr("y", (d) => yScale(d))
      .attr("height", (d) => height - yScale(d))
      .attr("fill", "steelblue")
      .attr("stroke", (d, i) => {
        if (pivotIndex !== undefined && i === pivotIndex) return "red";
        if (comparing && comparing.includes(i)) return "orange";
        return "none";
      })
      .attr("stroke-width", (d, i) => {
        if ((pivotIndex !== undefined && i === pivotIndex) || (comparing && comparing.includes(i)))
          return 3;
        return 0;
      });

    // EXIT: Remove bars that no longer have data.
    bars.exit()
      .transition()
      .duration(500)
      .attr("y", height)
      .attr("height", 0)
      .remove();
  }, [arr, pivotIndex, comparing]);

  return (
    <div className="w-full flex justify-center">
      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <svg 
          ref={svgRef} 
          width={800} 
          height={400} 
          className="bg-white dark:bg-gray-800" 
        />
      </div>
    </div>
  );
};