"use client";  // client component is needed for framer-motion
import { motion } from "framer-motion";
import Link from "next/link"
import Image from "next/image"
import React from "react";

// Import preview components
import DPPreview from "./card-animations/dp-preview";
import HeapPreview from "./card-animations/heap-preview";
import ArrayPreview from "./card-animations/array-preview";
import GraphPreview from "./card-animations/graph-preview";
import LinkedListPreview from "./card-animations/linkedlist-preview";
import TreePreview from "./card-animations/tree-preview";

// ==============================================
// TYPES AND UTILITIES
// ==============================================

type CardProps = {
  card_name: string;
  card_text: string;
  href: string;
  card_image?: string;
  index?: number;
  status?: "working" | "wip" | "partial";
};

const imageLoader = ({ width, height }: { width: number; height: number }): string => {
  return `https://placehold.co/${width}x${height}.png`;
};

// ==============================================
// HELPER FUNCTIONS
// ==============================================

/**
 * Renders the appropriate preview component based on card type
 */
const renderCardPreview = (card_name: string, href: string, card_image?: string, status?: CardProps["status"]) => {
  // Check which visualization to use
  const isGraphCard = card_name.toLowerCase() === "graphs" || href.includes("graphs");
  const isArrayCard = card_name.toLowerCase() === "arrays" || href.includes("arrays");
  const isTreeCard = card_name.toLowerCase() === "trees" || href.includes("trees");
  const isLinkedListCard = card_name.toLowerCase() === "linked lists" || href.includes("linked-lists");
  const isHeapCard = card_name.toLowerCase() === "heaps" || href.includes("heaps");
  const isDPCard = card_name.toLowerCase() === "dynamic programming" || href.includes("dynamic-programming");
  
  if (isGraphCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <GraphPreview />
      </div>
    );
  } else if (isArrayCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <ArrayPreview />
      </div>
    );
  } else if (isTreeCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <TreePreview />
      </div>
    );
  } else if (isLinkedListCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <LinkedListPreview />
      </div>
    );
  } else if (isHeapCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <HeapPreview />
      </div>
    );
  } else if (isDPCard) {
    return (
      <div className="bg-gray-800 h-[250px] flex items-center justify-center cursor-pointer">
        <DPPreview />
      </div>
    );
  } else {
    return (
      <Image
        width={600} 
        height={500}  
        src={card_image || imageLoader({ width: 1200, height: 1000})} 
        alt="Placeholder image" 
        className={status === "wip" ? "opacity-70" : ""}
      />
    );
  }
};

/**
 * Renders a status badge for cards
 */
const StatusBadge = ({ status }: { status?: CardProps["status"] }) => {
  if (!status || status === "working") return null;
  
  return (
    <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium z-10 
      ${status === "partial" ? "bg-yellow-600/80 text-yellow-100" : "bg-red-600/80 text-red-100"}`}>
      {status === "partial" ? "Partial" : "Coming Soon"}
    </div>
  );
};

// ==============================================
// CARD COMPONENTS
// ==============================================

/**
 * Card Style 1 - Basic card with image preview
 */
const CardStyle1 = ({ card_name, card_text, card_image, href, status}: CardProps) => {
  return (
    <div className="relative">
      <StatusBadge status={status} />
      
      <Link href={href}>
        <div className="w-full">
          {renderCardPreview(card_name, href, card_image, status)}
        </div>
        
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2">{card_name}</div>
          <p className="text-gray-700 dark:text-gray-300 text-base">{card_text}</p>
        </div>
      </Link>
    </div>
  );
};

/**
 * Card Style 2 - Gradient card with animation effects
 */
const CardStyle2 = ({href, card_image, card_name, card_text, index = 0, status = "wip"}: CardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="mb-6 bg-gradient-to-br from-gray-700/80 to-gray-800/90 rounded-lg shadow-lg overflow-hidden h-full relative"
  >
    <StatusBadge status={status} />
    
    <Link href={status === "wip" ? "#" : href} className={`h-full ${status === "wip" ? "pointer-events-none cursor-not-allowed" : ""}`}>
      <div className="flex flex-col h-full hover:bg-gray-700/20 transition-colors duration-200 p-5 rounded-lg">
        <div>
          <h5 className="font-bold text-2xl mb-3 text-gray-100">{card_name}</h5>
        </div>
        <div className="flex-grow mb-4">
          <p className="text-gray-300 text-base">{card_text}</p>
        </div>
        <motion.div 
          whileHover={{ scale: status === "wip" ? 1 : 1.02 }}
          className="rounded-lg overflow-hidden shadow-md bg-gray-800/60"
        >
          <div className="relative w-full aspect-[16/9]">
              <Image 
                width={500}
                height={300}
                src={card_image || imageLoader({ width: 1000, height: 600 })}
                alt="Algorithm visualization preview"
                className={`object-cover w-full h-full rounded-lg ${status === "working" ? "opacity-80 hover:opacity-100" : "opacity-50"} transition-opacity duration-300`}
              />
          </div>
        </motion.div>
      </div>
    </Link>
  </motion.div>
);

// ==============================================
// EXPORTS
// ==============================================

export { CardStyle1, CardStyle2, GraphPreview };
