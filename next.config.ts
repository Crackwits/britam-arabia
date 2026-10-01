import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  i18n: undefined, // App Router handles this manually
  async redirects() {
    return [
      {
        source: "/:lang/critical-environments",
        destination: "/:lang/our-journey#critical-environments",
        statusCode: 301,
      },
      {
        source: "/:lang/critical-environments/king-abdullah-economic-city-kaec",
        destination: "/:lang/critical-environments/lucid-motors-kaec",
        statusCode: 301,
      },
    ];
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cms.britamarabia.com",
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
