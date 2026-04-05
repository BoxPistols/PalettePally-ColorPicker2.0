/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require('path');

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@material/material-color-utilities'],
  // GitHub Pages / static export
  // Note: basePath is auto-injected by actions/configure-pages@v5
  ...(isStaticExport && {
    output: 'export',
    images: { unoptimized: true },
    trailingSlash: true,
  }),
  webpack: (config, {}) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
};

module.exports = nextConfig;
