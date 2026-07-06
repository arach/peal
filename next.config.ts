import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { hydratePealCredentialsFromFiles } from './lib/credentials/envFiles'
import { buildStrudelUpstreamAssetPrefix } from './lib/strudel/manage'


const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// Shared monorepo credentials (e.g. ../.env.local) — project .env.local still wins.
hydratePealCredentialsFromFiles()

const nextConfig: NextConfig = {
  // HMR websocket is blocked when the page is opened via 127.0.0.1 instead of localhost.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
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

  // Pin Turbopack root so file: sibling deps (hudsonkit) resolve correctly.
  turbopack: { root: projectRoot },

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
    // /strudel/* → app/strudel/[[...path]]/route.ts (HTML base rewrite).
    // Root-level Vite/Astro paths catch stale embed HTML still requesting /src, /@vite, etc.
    const strudelAssets = buildStrudelUpstreamAssetPrefix()
    return [
      {
        source: '/sounds/:path*',
        destination: '/assets/sounds/:path*',
      },
      { source: '/@vite/:path*', destination: `${strudelAssets}/@vite/:path*` },
      { source: '/@fs/:path*', destination: `${strudelAssets}/@fs/:path*` },
      { source: '/@id/:path*', destination: `${strudelAssets}/@id/:path*` },
      { source: '/src/:path*', destination: `${strudelAssets}/src/:path*` },
      {
        source: '/make-scrollable-code-focusable.js',
        destination: `${strudelAssets}/make-scrollable-code-focusable.js`,
      },
      { source: '/node_modules/:path*', destination: `${strudelAssets}/node_modules/:path*` },
    ]
  },
}

export default nextConfig