import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.noitatnemucod.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'media.kitsu.io',
      },
      {
        protocol: 'https',
        hostname: 'gogocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img1.ak.crunchyroll.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    qualities: [75, 90, 100], // Add the required image qualities
  },
};

export default nextConfig;
