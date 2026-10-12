import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build (out/) for Cloudflare Pages. No Node server at runtime.
  output: "export",
  images: {
    // The Image Optimization API needs a server; serve images as-is.
    unoptimized: true,
  },
};

export default nextConfig;
