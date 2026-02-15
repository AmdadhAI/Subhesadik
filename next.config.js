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
    unoptimized: true,
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