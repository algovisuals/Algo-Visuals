"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import Link from "next/link";

const UnderConstructionPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <Header />
      
      {/* Hero section */}
      <section className="h-[60vh] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(75,75,75,0.1)_0,_rgba(25,25,25,0.2)_50%,_rgba(10,10,10,0.3)_100%)]"></div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 px-4"
        >
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400 p-4 leading-tight">
            Under Construction
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            We're building this interactive visualization. Check back soon to explore this algorithm in detail.
          </p>
          
          {/* Construction animation */}
          <div className="mt-12 flex justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-gray-400"
            >
              {/* Gear icon */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="100" 
                height="100" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </motion.div>
          </div>
          
          <div className="mt-12">
            <motion.button
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 font-medium hover:from-gray-500 hover:to-gray-600 shadow-lg"
            >
              <Link href="/">
                Return to Home
              </Link>
            </motion.button>
          </div>
        </motion.div>
      </section>
      
      {/* Development status section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-200 mb-12"
          >
            Development Status
          </motion.h2>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg p-8"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-medium text-gray-300">Development Progress</span>
                <span className="text-gray-400">15%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-3">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>
            
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-medium text-gray-300 mb-3">Estimated Completion:</h3>
                <p className="text-gray-300">
                  We expect this visualization to be ready by June 2025. In the meantime, explore our other available algorithms!
                </p>
              </div>
              
              {/* GitHub repository link and contact information */}
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-medium text-gray-300 mb-3">Follow Our Progress</h3>
                <a 
                  href="https://github.com/algovisuals/Algo-Visuals" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-400 hover:text-blue-300 transition duration-200"
                >
                  <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                  Follow progress on GitHub!
                </a>
                <p className="mt-4 text-gray-300">
                  Have suggestions or want to contribute? Contact the main developer at:
                  <a 
                    href="mailto:contact@nevryk.com" 
                    className="ml-1 text-blue-400 hover:text-blue-300 transition duration-200"
                  >
                    contact@nevryk.com
                  </a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default UnderConstructionPage;
