/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["https://*.cloudworkstations.dev"],

  // Next.js 15: Use serverExternalPackages instead of experimental.serverComponentsExternalPackages
  serverExternalPackages: ['firebase-admin'],

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    // Added optimization config: minimumCacheTTL
    minimumCacheTTL: 60, // Cache images for 60 seconds by default
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd3j1z37yk0dbyk.cloudfront.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig