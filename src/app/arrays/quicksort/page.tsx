"use client"; // needed for d3
import React, { useState, FC, useRef } from "react";

// webpage visuals
import Header from "@/components/header";
import Footer from "@/components/footer";
import Sidebar from "@/components/code-side-bar";
import ArrayBase from "@/components/array-base";

const intervalMilliseconds = 500; // interval for auto-stepping

// algorithms core
import { generateRandomArray, ArrayVisualizer } from "@/algorithms-core/arrays_common";
import { SortStep, getQuickSortSteps } from "@/algorithms-core/quicksort";

const QuickSortPage: FC = () => {
  // Initialize state with a random array wrapped in a SortStep.
  const [currentStep, setCurrentStep] = useState<SortStep>(() => {
    const initial = generateRandomArray(25, 1, 50); // generates 25 bars from 1 to 50
    return { arr: initial };
  });

  // New state to hold all steps and the current step index.
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState<number>(0);
  const [isAutoStepping, setIsAutoStepping] = useState(false);
  const autoStepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // This function is called on each button press to perform one step.
  const generateSteps = () => {
    const newSteps = getQuickSortSteps(currentStep.arr);
    setSteps(newSteps);
    setStepIndex(1);
    setCurrentStep(newSteps[0]);
  };

  const handleStep = () => {
    if (steps.length === 0) {
      // Generate steps if not already created.
      generateSteps();
    } else if (stepIndex < steps.length) {
      setCurrentStep(steps[stepIndex]);
      setStepIndex(stepIndex + 1);
    }
  };

  const handleToggleAutoStep = () => {
    // Toggle state
    setIsAutoStepping(prevState => {
      const newState = !prevState;
      
      if (newState) {
        // Starting auto-stepping
        if (steps.length === 0) {
          // Generate steps first
          const newSteps = getQuickSortSteps(currentStep.arr);
          setSteps(newSteps);
          setStepIndex(1);
          setCurrentStep(newSteps[0]);
          
          // Set interval with the new steps we just created
          autoStepIntervalRef.current = setInterval(() => {
            setStepIndex(prevIndex => {
              if (prevIndex < newSteps.length) {
                setCurrentStep(newSteps[prevIndex]);
                return prevIndex + 1;
              } else {
                if (autoStepIntervalRef.current) {
                  clearInterval(autoStepIntervalRef.current);
                  autoStepIntervalRef.current = null;
                }
                setIsAutoStepping(false);
                return prevIndex;
              }
            });
          }, 500);
        } else {
          // Clear any existing interval first
          if (autoStepIntervalRef.current) {
            clearInterval(autoStepIntervalRef.current);
          }
          
          // Set up new interval with existing steps
          autoStepIntervalRef.current = setInterval(() => {
            setStepIndex(prevIndex => {
              if (prevIndex < steps.length) {
                setCurrentStep(steps[prevIndex]);
                return prevIndex + 1;
              } else {
                if (autoStepIntervalRef.current) {
                  clearInterval(autoStepIntervalRef.current);
                  autoStepIntervalRef.current = null;
                }
                setIsAutoStepping(false);
                return prevIndex;
              }
            });
          }, intervalMilliseconds);
        }
      } else {
        // Stopping auto-stepping
        if (autoStepIntervalRef.current) {
          clearInterval(autoStepIntervalRef.current);
          autoStepIntervalRef.current = null;
        }
      }
      
      return newState;
    });
  };


  //declaring constant variable numbers and assigning it to the array of numbers

  return (
    <div className="flex flex-col min-h-screen transition-colors">
      <Header />
      <main className="flex-grow w-full flex items-center justify-center px-4">
        <div className="w-full max-w-screen-2xl">
          <h1 className="text-4xl font-bold text-center mb-8">Quicksort Visualizer</h1>
          <div className="flex flex-col md:flex-row gap-8 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <Sidebar 
              opt1Action={handleToggleAutoStep} 
              opt2Action={handleStep} 
              opt3Action={() => {}} 
              isAutoStepping={isAutoStepping}
            />
            <div className="p-4 rounded-lg flex-1 flex flex-col items-center">
              <ArrayVisualizer step={currentStep} />
              <div className="flex justify-center items-center w-full mt-6">
                <ArrayBase array={currentStep.arr} pivotIndex={currentStep.pivotIndex} comparing={currentStep.comparing}/>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QuickSortPage;
