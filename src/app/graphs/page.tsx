"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";
import { CardStyle2 } from "@/components/card";
import { motion } from "framer-motion";
import DijkstrasPreview from "@/components/card-animations/graphs/dijkstras-preview"; // Import the preview component

const cardInfo: {
  href: string;
  card_name: string;
  card_text: string;
  status: "working" | "wip" | "partial";
  preview?: React.ReactNode; // Add optional preview property
}[] = [
  {
    href: "/graphs/dijkstras",
    card_name: "Dijkstra's Algorithm",
    card_text:
      "Dijkstra's algorithm finds the shortest path between nodes in a graph with non-negative edge weights. It uses a priority queue to greedily select the closest unvisited vertex.",
    status: "working",
    preview: <DijkstrasPreview />, // Add the preview component here
  },
  {
    href: "/graphs/breadth-first-search",
    card_name: "Breadth-First Search (BFS)",
    card_text:
      "BFS is a graph traversal algorithm that explores all vertices at the present depth before moving on to vertices at the next depth level. It's ideal for finding the shortest path on unweighted graphs.",
    status: "wip",
  },
  {
    href: "/graphs/depth-first-search",
    card_name: "Depth-First Search (DFS)",
    card_text:
      "DFS is a graph traversal algorithm that explores as far as possible along each branch before backtracking. It's useful for topological sorting, detecting cycles, and maze generation.",
    status: "wip",
  },
  {
    href: "/graphs/bellman-ford",
    card_name: "Bellman-Ford Algorithm",
    card_text:
      "The Bellman-Ford algorithm computes shortest paths from a single source vertex to all other vertices, even with negative edge weights. It can detect negative cycles in a graph.",
    status: "wip",
  },
  {
    href: "/graphs/prim",
    card_name: "Prim's Algorithm",
    card_text:
      "Prim's algorithm finds a minimum spanning tree for a weighted undirected graph, connecting all vertices with the minimum possible total edge weight.",
    status: "wip",
  },
  {
    href: "/graphs/kruskal",
    card_name: "Kruskal's Algorithm",
    card_text:
      "Kruskal's algorithm finds a minimum spanning tree for a connected weighted graph, adding the smallest edge at each step that doesn't form a cycle.",
    status: "wip",
  },
  {
    href: "/graphs/topological-sort",
    card_name: "Topological Sort",
    card_text:
      "Topological sorting arranges the nodes of a directed acyclic graph in a linear ordering such that for every directed edge (u, v), vertex u comes before v.",
    status: "wip",
  },
  {
    href: "/graphs/strongly-connected",
    card_name: "Strongly Connected Components",
    card_text:
      "A strongly connected component is a portion of a directed graph in which there is a path from each vertex to every other vertex. Kosaraju's or Tarjan's algorithms can find them.",
    status: "wip",
  },
];

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
            Graph Algorithms
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Visualize and understand the complex relationships and traversals in
            graph structures through interactive demonstrations
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
              <CardStyle2 key={index} {...card} index={index} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default page;
