/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@material/material-color-utilities'],
  webpack: (config, {}) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');

    return config;
  },
};

module.exports = nextConfig;
