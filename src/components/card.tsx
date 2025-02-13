"use client";  // client component is needed for framer-motion
import { motion } from "framer-motion";
import Link from "next/link"
import Image from "next/image"

type CardProps = {
  card_name: string;
  card_text: string;
  href: string;
  card_image?: string;
};

type loaderDimension ={
  
}

const imageLoader = ({ width, height }: { width: number; height: number }): string => {
  return `https://placehold.co/${width}x${height}.png`;
};

const CardStyle1 = ({ card_name, card_text, card_image, href}: CardProps) => (
  <div className = "">
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)" }}
        transition={{ duration: 0.3 }}
        className="max-w-sm rounded overflow-hidden shadow-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
      >
      <div className= "w-50">
        <Image
        width={600} 
        height={500}  
        src={card_image || imageLoader({ width: 1200, height: 1000})} 
        alt="Placeholder image" 
        />
      </div>
      
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{card_name}</div>
        <p className="text-gray-700 dark:text-gray-300 text-base">{card_text}</p>
      </div>
      </motion.div>
    </Link>
  </div>

);

export default CardStyle1;
