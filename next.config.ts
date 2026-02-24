import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "test.file.sutainbuyant.com",
      },
      {
        protocol: "https",
        hostname: "file.sutainbuyant.com",
      },
      {
        protocol: "https",
        hostname: "test.img.sutainbuyant.com",
      },
      {
        protocol: "https",
        hostname: "img.sutainbuyant.com",
      },
    ],
  },
};

export default nextConfig;
