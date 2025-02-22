"use client"; // needed for d3

import React, { useState, useEffect, FC, useRef } from "react";
import * as d3 from "d3";

// webpage visuals
import Header from "@/components/header";
import Footer from "@/components/footer";
import Sidebar from "@/components/code-side-bar";

// algorithms core
import { generateRandomArray } from "@/algorithms-core/arrays_common";
import { SortStep, getQuickSortSteps } from "@/algorithms-core/quicksort";

const QuickSortPage: FC = () => {
  // Initialize state with a random array wrapped in a SortStep.
  const [currentStep, setCurrentStep] = useState<SortStep>(() => {
    const initial = generateRandomArray(25, 1, 1000); // generates 25 bars from 1 to 1000
    return { arr: initial };
  });

  // New state to hold all steps and the current step index.
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);

  // This function is called on each button press to perform one step.
  const handleStep = () => {
    if (steps.length === 0) {
      // Generate steps if not already created.
      const newSteps = getQuickSortSteps(currentStep.arr);
      setSteps(newSteps);
      setStepIndex(1);
      setCurrentStep(newSteps[0]);
    } else if (stepIndex < steps.length) {
      setCurrentStep(steps[stepIndex]);
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <div className="flex flex-col min-h-screen transition-colors">
      <Header />
      <main className="flex-grow w-full flex items-center justify-center px-4">
        <div className="w-full max-w-screen-2xl">
          <h1 className="text-4xl font-bold text-center mb-8">Quicksort Visualizer</h1>
          <div className="flex flex-col md:flex-row gap-8">
            <Sidebar 
              opt1Action={handleStep} 
              opt2Action={() => {}} 
              opt3Action={() => {}} 
            />
            <div className="flex-1 bg-white dark:bg-gray-800 p-6 shadow-lg rounded-lg">
              <ArrayVisualizer step={currentStep} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface ArrayVisualizerProps {
  step: SortStep;
}

const ArrayVisualizer: FC<ArrayVisualizerProps> = ({ step }) => {
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
      <div className="p-4" style={{ background: "#f5f5f5" }}>
        <svg ref={svgRef} width={800} height={400} />
      </div>
    </div>
  );
};

export default QuickSortPage;
