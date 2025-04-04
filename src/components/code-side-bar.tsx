"use client";
import { useState } from "react";

interface SidebarProps {
  opt1Action: () => void;
  opt2Action: () => void;
  opt3Action: () => void;
  isAutoStepping?: boolean; // Add this prop
}

/**
 * Sidebar main function will simply execute 3 different functions
 * @param opt1Action: the stepping button, step through the algorithm at one step
 * @param opt2Action: N/A not implemented
 * @param opt3Action: N/A not implemented
 * @param isAutoStepping: boolean to determine if the algorithm is auto stepping
 * @returns 
 */
export default function Sidebar({ opt1Action, opt2Action, opt3Action, isAutoStepping }: SidebarProps) {
  const [open, setOpen] = useState(false);
  
  return (
    <>
      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-gray-800 text-white shadow-lg transition-transform duration-300 transform ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Algorithm Controls</h2>
          <button
            onClick={opt1Action}
            className={`w-full p-2 rounded-md text-left ${
              isAutoStepping 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            Toggle Auto Stepping (0.5s)
          </button>
          <button
            onClick={opt2Action}
            className="w-full p-2 bg-gray-700 rounded-md text-left mt-2 hover:bg-gray-600"
          >
            Manual Step
          </button>
          <button
            onClick={opt3Action}
            className="w-full p-2 bg-gray-700 rounded-md text-left mt-2 hover:bg-gray-600"
          >
            Option 3
          </button>
        </div>
      </div>

      {/* Toggle Button (Tab) */}
      {/*
        This button is always visible.
        - When closed, it sits at the right edge (right-0) as the only visible element.
        - When open, it shifts to the left edge of the panel (right-64).
      */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed top-1/2 transform -translate-y-1/2 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white p-2 rounded-l-md shadow-lg transition-all duration-300 ${
          open ? "right-64" : "right-0"
        }`}
      >
        {open ? (
          // X Icon: click to close the sidebar.
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Bars Icon: click to open the sidebar.
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </>
  );
}
