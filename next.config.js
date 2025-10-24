/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@supabase/supabase-js', '@supabase/auth-js'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*`,
      },
    ];
  },
  // Turbopack configuration (default in Next.js 16)
  // Webpack fallbacks moved to turbopack for Next.js 16 compatibility
  turbopack: {
    resolveAlias: {
      // Turbopack doesn't need these fallbacks as it handles them differently
    },
  },
};

module.exports = nextConfig;
