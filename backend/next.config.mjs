/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
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
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost', 'wexcommerce.dynv6.net:8002'],
    },
  },
}

export default nextConfig
