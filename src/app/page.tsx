"use client";
import Header from "../components/header";
import Footer from "../components/footer";
import { CardStyle1 } from "@/components/card";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      {/* Hero section with centered title */}
      <section className="h-[90vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(75,75,75,0.1)_0,_rgba(25,25,25,0.2)_50%,_rgba(10,10,10,0.3)_100%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10"
        >
          <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 p-4 leading-tight">
            algovisuals.
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Visualize and understand algorithms through interactive demonstrations
          </p>
          <div className="mt-10">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#explore"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 font-medium hover:from-gray-500 hover:to-gray-600 transition duration-300 shadow-lg"
            >
              Explore
            </motion.a>
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
                />
              </CardWrapper>
              
              <CardWrapper href="/linked-lists" delay={0.2}>
                <CardStyle1 
                  card_name="Linked Lists" 
                  card_text="Explore operations on singly and doubly linked lists." 
                  href="/linked-lists" 
                  status="wip"
                />
              </CardWrapper>
              
              <CardWrapper href="/trees" delay={0.3}>
                <CardStyle1 
                  card_name="Trees" 
                  card_text="Understand tree traversals and binary search trees." 
                  href="/trees" 
                  status="wip"
                />
              </CardWrapper>
              
              <CardWrapper href="/graphs" delay={0.4}>
                <CardStyle1 
                  card_name="Graphs" 
                  card_text="Visualize graph algorithms like BFS, DFS, and Dijkstra's." 
                  href="/graphs" 
                  status="partial"
                />
              </CardWrapper>
              
              <CardWrapper href="/heaps" delay={0.5}>
                <CardStyle1 
                  card_name="Heaps" 
                  card_text="Learn about heap operations and heapsort algorithm." 
                  href="/heaps" 
                  status="wip"
                />
              </CardWrapper>
              
              <CardWrapper href="/dynamic-programming" delay={0.6}>
                <CardStyle1 
                  card_name="Dynamic Programming" 
                  card_text="Master DP through interactive visualizations." 
                  href="/dynamic-programming" 
                  status="wip"
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
  delay, 
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
      transition={{ delay }}
      className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
