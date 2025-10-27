import type { NextConfig } from 'next'
import dns from 'node:dns'
import path from 'node:path'

dns.setDefaultResultOrder('ipv4first')

const isProduction = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    //
    // Add your admin domain here
    //
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'wexcommerce.dynv6.net',
        pathname: '**',
      },
    ],
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(__dirname, '..'), // makes it absolute
    resolveAlias: {
      ':wexcommerce-types': '../packages/wexcommerce-types',
      ':wexcommerce-helper': '../packages/wexcommerce-helper',
    },
  },
  //
  // Nginx will do gzip compression. We disable
  // compression here so we can prevent buffering
  // streaming responses
  //
  compress: false,
  //
  // Add your admin domain here
  //
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8001', 'wexcommerce.dynv6.net:8001'],
    },
    // workerThreads: false,
  },
  reactCompiler: true,
  logging: {
    fetches: {
      fullUrl: !isProduction,
    },
  },
}

export default nextConfig
