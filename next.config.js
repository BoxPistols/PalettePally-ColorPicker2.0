/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require('path');

const isGhPages = process.env.GITHUB_PAGES === 'true';
const repoName = 'PalettePally-ColorPicker2.0';

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@material/material-color-utilities'],
  // GitHub Pages: static export + basePath
  ...(isGhPages && {
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
