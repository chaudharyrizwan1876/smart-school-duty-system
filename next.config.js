/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config) => {
    config.externals.push({
      "whatsapp-web.js": "commonjs whatsapp-web.js",
    });
    return config;
  },
};

module.exports = nextConfig;
