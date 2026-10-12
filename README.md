# Algo-Visuals

**https://algovisuals.com**

_Website not working?_ Check the status of my applications: https://up.solnas.net/status/nevryk

Algo-Visuals is an interactive web application that demonstrates how classic algorithms work through dynamic, animated visualizations. Built with a modern, widely adopted tech stack, the project is designed for performance, scalability, and an engaging user experience.

## Developers

| Name        | Role           | GitHub                                  |
| ----------- | -------------- | --------------------------------------- |
| **Nevryk**  | Main Developer | [nsoliven](https://github.com/nsoliven) |
| **Kayleen** | Contributor    | [kayuh7](https://github.com/kayuh7)     |

---

## Table of Contents

- Overview
- Features
- Implemented Algorithms
- Tech Stack
- Getting Started
- Deploy (Cloudflare Pages)
- Contributing
- License

---

## Overview

Algo-Visuals brings algorithms to life by showing each step through interactive animations and visual representations. The project leverages modern web technologies to deliver fast, SEO-friendly pages and a responsive interface. Whether you want to see sorting algorithms in action or follow a graph traversal, this application provides a clear and engaging learning experience.

---

## Features

- **Interactive Visualizations:** Uses D3.js to render algorithm steps in real time
- **Smooth Animations:** Enhances user interactions with fluid transitions powered by Framer Motion
- **Modern Styling:** Features a responsive, clean interface using Tailwind CSS
- **Scalable Architecture:** Leverages Next.js features for improved performance and SEO
- **Algorithm Controls:** Step through algorithms manually or watch them execute automatically

---

## Implemented Algorithms

### Arrays

- **Quick Sort:** Visualize the divide-and-conquer strategy with pivot selection and partitioning
- _Coming Soon:_ Merge Sort, Bubble Sort, Binary Search, Selection Sort, and more

### Graphs

- **Dijkstra's Algorithm:** Visualize finding the shortest paths in a weighted graph
- _Coming Soon:_ BFS, DFS, and more graph algorithms

_Additional algorithm categories (Trees, Linked Lists, Heaps, Dynamic Programming) are under development_

---

## Tech Stack

### Next.js & React

- **Next.js 15 (App Router):** Built as a fully static export (`output: "export"`) into `out/`
- **React 19:** Powers the UI with reusable components

The site has no server, API routes or server actions. It must not be deployed as a Node server (`next start`, standalone output or Docker).

### Styling & Animation

- **Tailwind CSS:** A utility-first CSS framework for consistent styling
- **Framer Motion:** For smooth, declarative animations

### Visualization

- **D3.js:** A powerful library for data-driven visualizations
- **TypeScript:** For type safety and enhanced developer experience

---

## Getting Started

### Prerequisites

- **Node.js** 22 (20+ works)
- **npm**

### Installation

1. **Clone the repository:**

   ```bash
   git clone git@github.com:algovisuals/Algo-Visuals.git
   cd Algo-Visuals
   ```

2. **Install dependencies:**

   ```bash
   npm ci
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

   Open your browser and visit `http://localhost:3000` to see the application in action.

4. **Build the static site:**

   ```bash
   npm run build
   ```

   This runs the Jest tests, then writes the static site to `out/`. Preview it with any static file server, for example `npx serve out`.

---

## Deploy (Cloudflare Pages)

Connect the GitHub repo in Cloudflare Pages with these build settings:

- Framework preset: **Next.js (Static HTML Export)**
- Build command: `npm run build`
- Build output directory: `out`
- Environment variable: `NODE_VERSION=22`

Cloudflare serves the files in `out/` directly; there is nothing to run.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and ensure they adhere to our coding standards
4. Submit a pull request with a detailed description of your changes

Please open an issue first if you plan significant changes or need clarification on project goals.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
