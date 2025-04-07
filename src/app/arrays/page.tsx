"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { CardStyle2 } from "@/components/card";
import { motion } from "framer-motion";

const cardInfo: {
    href: string;
    card_name: string;
    card_text: string;
    status: "working" | "wip" | "partial";
}[] = [
    {
        href: "/arrays/quicksort",
        card_name: "Quick Sort",
        card_text: "Quick Sort is a sorting algorithm that uses a divide-and-conquer strategy to sort an array. It picks an element as a pivot, and partitions the array into two sub-arrays based on whether the elements are less than or greater than the pivot. Then it applys the same process to the two sub-arrays and repeats until the array is sorted.",
        status: "working"
    },
    {
        href: "/arrays/mergesort",
        card_name: "Merge Sort",
        card_text: "Merge Sort is a sorting algorithm that uses a divide and conquer strategy to sort a list by repeatedly dividing it into smaller sublists",
        status: "wip"
    },
    {
        href: "/arrays/bubblesort",
        card_name: "Bubble Sort",
        card_text: "Bubble Sort is a sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
        status: "wip"
    },
    {
        href: "/arrays/binarysearch",
        card_name: "Binary Search",
        card_text: "Binary Search is a searching algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search space in half.",
        status: "wip"
    },
    {
        href: "/arrays/insertion",
        card_name: "Insertion Sort",
        card_text: "Insertion Sort is a sorting algorithm that builds the final sorted array one item at a time, by taking elements and placing them in their correct position.",
        status: "wip"
    },
    {
        href: "/arrays/selectionsort",
        card_name: "Selection Sort",
        card_text: "Selection Sort is a sorting algorithm that repeatedly selects the smallest element from the unsorted portion and puts it at the beginning.",
        status: "wip"
    },
    {
        href: "/arrays/twopointer",
        card_name: "Two Pointer Technique",
        card_text: "Two Pointer is an algorithm technique where two pointers iterate through a data structure, often moving independently at different speeds or directions.",
        status: "wip"
    },
    {
        href: "/arrays/slidingdoor",
        card_name: "Sliding Window",
        card_text: "Sliding Window is a computational technique that aims to reduce the use of nested loops and replace it with a single loop, reducing time complexity.",
        status: "wip" 
    },
    {
        href: "/arrays/dynamicarrays",
        card_name: "Dynamic Arrays",
        card_text: "Dynamic Arrays automatically resize themselves when more storage is needed, understanding this data structure is crucial for efficient programming.",
        status: "wip"
    },
]

const page = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <Header />
            
            {/* Hero section */}
            <section className="relative overflow-hidden py-20 bg-gradient-to-b from-gray-900 to-gray-800">
                {/* Background effect */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(75,75,75,0.1)_0,_rgba(25,25,25,0.2)_50%,_rgba(10,10,10,0.3)_100%)]"></div>
                
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center z-10 relative max-w-4xl mx-auto px-4"
                >
                    <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 p-4 leading-tight">
                        Array Algorithms
                    </h1>
                    <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
                        Explore and visualize fundamental array operations and sorting algorithms through interactive demonstrations
                    </p>
                </motion.div>
            </section>

            {/* Content section */}
            <main className="flex-grow py-16 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
                <div className="max-w-[1200px] mx-auto">
                    <motion.h2 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-2xl font-bold mb-10 text-gray-200 border-b border-gray-700 pb-3"
                    >
                        Choose an Algorithm to Visualize
                    </motion.h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {cardInfo.map((card, index) => (
                            <CardStyle2 
                                key={index} 
                                {...card} 
                                index={index} 
                            />
                        ))}
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    )
}

export default page