const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, {}) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src')

    return config
  },
}

module.exports = nextConfig
