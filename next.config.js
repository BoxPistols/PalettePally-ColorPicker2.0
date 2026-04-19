/* eslint @typescript-eslint/no-var-requires: "off" */

const path = require('path');

// static export は明示的にオプトイン (NEXT_PUBLIC_STATIC_EXPORT=true) のときのみ。
// GITHUB_ACTIONS 環境変数だけで有効化すると、E2E / Lighthouse など `next start` を
// 必要とする別の workflow が `output: export` と衝突して失敗する。GitHub Pages
// デプロイ用 workflow (`.github/workflows/nextjs.yml`) 側で明示的に env を渡す。
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';
// GitHub Actions から自動取得 (GITHUB_REPOSITORY="owner/repo") or 環境変数 or fallback
const repoName =
  process.env.REPO_NAME ||
  (process.env.GITHUB_REPOSITORY?.split('/')[1]) ||
  'PalettePally-ColorPicker2.0';

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
