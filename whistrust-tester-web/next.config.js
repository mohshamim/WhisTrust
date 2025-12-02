/** @type {import('next').NextConfig} */
const nextConfig = {
  // Increase timeout for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig

