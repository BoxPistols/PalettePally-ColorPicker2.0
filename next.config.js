/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require('path');

const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true' || process.env.GITHUB_ACTIONS === 'true';
const repoName = 'PalettePally-ColorPicker2.0';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@material/material-color-utilities'],
  // GitHub Pages / static export
  ...(isStaticExport && {
    output: 'export',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
    images: { unoptimized: true },
    trailingSlash: true,
  }),
  webpack: (config, {}) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
};

module.exports = nextConfig;
