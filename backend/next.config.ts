import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  images: {
    //
    // Add your backend domain here
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
  //
  // Nginx will do gzip compression. We disable
  // compression here so we can prevent buffering
  // streaming responses
  //
  compress: false,
  //
  // Add your backend domain here
  //
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:8001', 'wexcommerce.dynv6.net:8001'],
    },
    turbo: {
      root: '..',
      resolveAlias: {
        ':wexcommerce-types': '../packages/wexcommerce-types',
        ':wexcommerce-helper': '../packages/wexcommerce-helper',
      },
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
}

export default nextConfig
