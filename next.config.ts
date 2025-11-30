import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude whistrust-tester-web from the build (it's a separate project)
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ignore the whistrust-tester-web directory during build
  experimental: {
    // This helps exclude directories from the build
  },
};

export default nextConfig;
