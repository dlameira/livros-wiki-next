import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg'],
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'https://directus-production-afdd.up.railway.app/admin',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'https://directus-production-afdd.up.railway.app/admin/:path*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
