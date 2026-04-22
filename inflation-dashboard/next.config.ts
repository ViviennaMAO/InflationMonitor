import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Ensure Vercel serverless functions can read pipeline JSON files at runtime.
  // Next.js' output file tracing otherwise only bundles explicitly imported modules.
  outputFileTracingIncludes: {
    "/api/**/*": ["./data/pipeline/**/*"],
  },
};

export default nextConfig;
