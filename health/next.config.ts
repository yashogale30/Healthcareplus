import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ignore ESLint errors
  },
  typescript: {
    ignoreBuildErrors: true, // ignore TS type errors
  },
};

export default nextConfig;

