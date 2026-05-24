import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/feed.xml",
        destination: "/api/rss",
      },
      {
        source: "/export/:slug",
        destination: "/api/export/:slug",
      },
    ];
  },
};

export default nextConfig;
