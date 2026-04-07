import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['postgres'],
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin.html',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
