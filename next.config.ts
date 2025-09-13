import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.noitatnemucod.net',
      },
    ],
    qualities: [75, 90, 100], // Add the required image qualities
  },
};

export default nextConfig;
