"use client";
import Header from "../components/header";
import Footer from "../components/footer";
import { CardStyle1 } from "@/components/card";
import { motion } from "framer-motion";

// Import preview components needed for CardStyle1
import ArrayPreview from "@/components/card-animations/array-preview";
import LinkedListPreview from "@/components/card-animations/linkedlist-preview";
import TreePreview from "@/components/card-animations/tree-preview";
import GraphPreview from "@/components/card-animations/graph-preview";
import HeapPreview from "@/components/card-animations/heap-preview";
import DPPreview from "@/components/card-animations/dp-preview";


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      {/* Hero section with centered title */}
      <section className="h-[60vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(75,75,75,0.1)_0,_rgba(25,25,25,0.2)_50%,_rgba(10,10,10,0.3)_100%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 p-4 leading-tight">
            Algo-Visuals
          </h1>
          <div className=" text-xl text-gray-300 max-w-3xl mx-auto">
            <div className="relative inline-block">
              <motion.span
                className="font-semibold px-3 bg-gray-800 rounded-full inline-block text-transparent bg-clip-text border border-gray-600 relative"
                initial={{ 
                  backgroundImage: "linear-gradient(to right, rgb(0, 123, 255), rgb(0, 255, 128))" 
                }}
                animate={{ 
                  backgroundImage: "linear-gradient(to right, rgb(0, 255, 128), rgb(0, 123, 255))" 
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              >
                Open-Source
              </motion.span>
              <motion.div
                className="absolute inset-0 rounded-full opacity-10 z-0"
                initial={{ 
                  backgroundImage: "linear-gradient(to right, rgb(0, 123, 255), rgb(0, 255, 128))" 
                }}
                animate={{ 
                  backgroundImage: "linear-gradient(to right, rgb(0, 255, 128), rgb(0, 123, 255))" 
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              />
            </div>
            , Beautifully visualized algorithms through interactive demonstrations
          </div>

          <div className="mt-10">
          <div className ="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.10}}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('explore');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 font-medium hover:from-gray-500 hover:to-gray-600 shadow-lg"
            >
              Explore
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://github.com/algovisuals/Algo-Visuals', '_blank')}
              className="p-4 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 font-medium hover:from-gray-500 hover:to-gray-600 shadow-lg flex items-center gap-2"
            >
              {/* Github ICON SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>

            </motion.button>
          </div>


          </div>
        </motion.div>
        
        {/* Subtle scroll indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute bottom-10 text-gray-400"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </motion.div>
        
        {/* Card peek at bottom of hero section */}
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-gray-800 to-transparent"></div>
      </section>

      {/* Cards section */}
      <section id="explore" className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
        <main className="flex-grow flex flex-col items-center justify-center m-10 space-y-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-200"
          >
            Explore Algorithm Visualizations
          </motion.h2>

          {/* Display cards of the different algorithm pages */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="max-w-[1000px] mx-auto w-full"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <CardWrapper href="/arrays" delay={0.1}>
                <CardStyle1 
                  card_name="Arrays" 
                  card_text="Visualize array operations and sorting algorithms." 
                  href="/arrays" 
                  status="partial"
                  preview={<ArrayPreview />} // Pass preview component
                />
              </CardWrapper>
              
              <CardWrapper href="/linked-lists" delay={0.2}>
                <CardStyle1 
                  card_name="Linked Lists" 
                  card_text="Explore operations on singly and doubly linked lists." 
                  href="/linked-lists" 
                  status="wip"
                  preview={<LinkedListPreview />} // Pass preview component
                />
              </CardWrapper>
              
              <CardWrapper href="/trees" delay={0.3}>
                <CardStyle1 
                  card_name="Trees" 
                  card_text="Understand tree traversals and binary search trees." 
                  href="/trees" 
                  status="wip"
                  preview={<TreePreview />} // Pass preview component
                />
              </CardWrapper>
              
              <CardWrapper href="/graphs" delay={0.4}>
                <CardStyle1 
                  card_name="Graphs" 
                  card_text="Visualize graph algorithms like BFS, DFS, and Dijkstra's." 
                  href="/graphs" 
                  status="partial"
                  preview={<GraphPreview />} // Pass preview component
                />
              </CardWrapper>
              
              <CardWrapper href="/heaps" delay={0.5}>
                <CardStyle1 
                  card_name="Heaps" 
                  card_text="Learn about heap operations and heapsort algorithm." 
                  href="/heaps" 
                  status="wip"
                  preview={<HeapPreview />} // Pass preview component
                />
              </CardWrapper>
              
              <CardWrapper href="/dynamic-programming" delay={0.6}>
                <CardStyle1 
                  card_name="Dynamic Programming" 
                  card_text="Master DP through interactive visualizations." 
                  href="/dynamic-programming" 
                  status="wip"
                  preview={<DPPreview />} // Pass preview component
                />
              </CardWrapper>
            </div>
          </motion.div>
        </main>
      </section>
      
      <Footer />
    </div>
  );
}

// Card wrapper component with animation
const CardWrapper = ({ 
  children, 
}: { 
  children: React.ReactNode; 
  delay: number; 
  href: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: 0, duration: 0.3 }}
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
