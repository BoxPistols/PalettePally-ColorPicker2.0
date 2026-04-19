import type { AppProps } from 'next/app';
import createCache from '@emotion/cache';
import Head from 'next/head';
import '../src/styles/globals.css';
import { CacheProvider } from '@emotion/react';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppShell } from '@/components/common/AppShell';

export default function App({ Component, pageProps }: AppProps) {
  const cache = createCache({ key: 'css', prepend: true, stylisPlugins: [] });
  cache.compat = true;

  return (
    <AuthProvider>
      <AppShell>
        <CacheProvider value={cache}>
          <Head>
            <title>Pallett Pally - MUI カラーパレット生成</title>
            <meta name='description' content='Material You ベースの MUI 互換カラーパレット生成ツール。シードカラーから light/dark 両対応の5色構成を自動生成。' />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
          </Head>
          <Component {...pageProps} />
        </CacheProvider>
      </AppShell>
    </AuthProvider>
  );
}
