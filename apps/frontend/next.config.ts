import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Optimize handling of large assets like icons
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization?.splitChunks,
        chunks: 'all',
        maxSize: 200000, // 200KB
      },
    };
    
    return config;
  },
};

export default withPWA(nextConfig);
