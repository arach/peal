/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for GitHub Pages
  output: process.env.BUILD_STATIC === 'true' ? 'export' : undefined,
  
  // GitHub Pages serves from a subpath
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  
  // Enable Turbopack for faster development builds
  turbopack: {},
  
  // Disable image optimization for static export
  images: {
    unoptimized: process.env.BUILD_STATIC === 'true',
  },
  
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

export default nextConfig;