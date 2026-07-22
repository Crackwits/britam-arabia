import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  i18n: undefined, // App Router handles this manually
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging.britamarabia.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "www.figma.com",
      },
      {
        protocol: "https",
        hostname: "s3-alpha.figma.com",
      },
      {
        protocol: "https",
        hostname: "**.figma.com",
      },
    ],
    unoptimized: isDevelopment,
  },
};

export default nextConfig;
