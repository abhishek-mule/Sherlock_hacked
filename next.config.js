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
    domains: ['thpajmudzyytnpcbzbru.supabase.co', 'ui-avatars.com', 'avatars.dicebear.com', 'peoplify.pics', 'api.multiavatar.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thpajmudzyytnpcbzbru.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'peoplify.pics',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.multiavatar.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig;