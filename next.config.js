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
  // No remote image hosts. The project is local-first; all record data is read
  // from data/*.json at runtime via /api/students, never from a hosted backend.
};

module.exports = nextConfig;
