/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use SWC instead of Babel
  compiler: {
    emotion: true,
  },
  // Tell Next.js to transpile with SWC despite Babel config
  experimental: {
    forceSwcTransforms: true, // Force SWC transforms
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.cache = false;
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    domains: ['thpajmudzyytnpcbzbru.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thpajmudzyytnpcbzbru.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;