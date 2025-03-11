"use client";

import { useEffect, FC, useRef } from "react";
import * as d3 from "d3";

interface ArrayBaseProps {
    array: number[]; 
    pivotIndex?: number;
    comparing?: number[];
}

const ArrayBase: FC<ArrayBaseProps> = ({array, pivotIndex, comparing}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const boxSize = 50;
        const spacing = 10;
        const padding = 50;

        const width = array.length * (boxSize + spacing) - spacing;
        const height = 200;

        const startX = 0;

        // Set SVG dimensions
        svg.attr("width", width).attr("height", height);

        // Draw array boxes
        svg
        .selectAll(".array-box")
        .data(array)
        .enter()
        .append("rect")
        .attr("class", "array-box")
        .attr("x", (d, i) => i * (boxSize + spacing))
        .attr("y", 50)
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("stroke", "black")
        .attr("fill", (d, i) => {
            if (pivotIndex !== undefined && i == pivotIndex) return "red";
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
        .attr("x", (d, i) => i * (boxSize + spacing) + boxSize / 2)
        .attr("y", 50 + boxSize / 2 + 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(d => d);
    }, [array]); // Re-run if the array changes

    return (
        <div className="flex justify-center items-center">
            <svg ref={svgRef}></svg>
        </div>
    );
};

export default ArrayBase;