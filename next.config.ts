import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.metabooks.com' },
      { protocol: 'https', hostname: 'directus-production-afdd.up.railway.app' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
};

export default nextConfig;
