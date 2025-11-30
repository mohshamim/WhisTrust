/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow API routes to run longer for test execution
  api: {
    responseLimit: false,
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Increase timeout for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig

