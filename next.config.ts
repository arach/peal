import type { NextConfig } from 'next'
import { hydratePealCredentialsFromFiles } from './lib/credentials/envFiles'

// Shared monorepo credentials (e.g. ../.env.local) — project .env.local still wins.
hydratePealCredentialsFromFiles()

const nextConfig: NextConfig = {
  transpilePackages: ['hudsonkit', '@hudsonkit/ai', '@voxd/client'],
  serverExternalPackages: ['@earendil-works/pi-ai'],

  // Tree-shake the Phosphor SSR icon barrel (used by the Sound Studio icon set).
  // Studio icons import from /ssr so server + client share the same glyph paths.
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react/ssr'],
  },
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
  // Note: rewrites don't work with static export, sounds will be in public folder
  async rewrites() {
    // Only apply rewrites for non-static builds
    if (process.env.BUILD_STATIC === 'true') {
      return []
    }
    return [
      {
        source: '/sounds/:path*',
        destination: '/assets/sounds/:path*',
      },
    ]
  },
}

export default nextConfig