/** @type {import('next').NextConfig} */
const nextConfig = {
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