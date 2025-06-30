/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack for faster development builds
  turbopack: {},
  
  // Allow serving static assets from the assets directory
  async rewrites() {
    return [
      {
        source: '/sounds/:path*',
        destination: '/assets/sounds/:path*',
      },
    ];
  },
};

module.exports = nextConfig;