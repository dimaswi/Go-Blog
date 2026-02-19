/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL || 'http://backend:8080'}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_INTERNAL_URL || 'http://backend:8080'}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '147.93.104.139',
        port: '2222',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    NEXT_PUBLIC_UPLOAD_URL: process.env.NEXT_PUBLIC_UPLOAD_URL || 'http://localhost:8080',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:2220',
  },
};

module.exports = nextConfig;
