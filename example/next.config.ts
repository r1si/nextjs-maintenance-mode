import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
  // Enable React strict mode
  reactStrictMode: true,
}

export default nextConfig
