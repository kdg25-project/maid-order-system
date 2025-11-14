import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.kdgn.tech",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.kdgn.tech",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
