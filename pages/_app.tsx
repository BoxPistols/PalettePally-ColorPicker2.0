import type { AppProps } from 'next/app';
import createCache from '@emotion/cache';
import { theme } from '@/lib/theme';
import Head from 'next/head';
import '../src/styles/globals.css';
import { ThemeProvider, CacheProvider } from '@emotion/react';

export default function App({ Component, pageProps }: AppProps) {
  const cache = createCache({ key: 'css', prepend: true, stylisPlugins: [] });
  cache.compat = true;

  return (
    <>
      <ThemeProvider theme={theme}>
        <CacheProvider value={cache}>
          <Head>
            <title>Pallett Pally - MUI カラーパレット生成</title>
            <meta name='description' content='Material You ベースの MUI 互換カラーパレット生成ツール。シードカラーから light/dark 両対応の5色構成を自動生成。' />
            <meta name='viewport' content='width=device-width, initial-scale=1' />
          </Head>
          <Component {...pageProps} />
        </CacheProvider>
      </ThemeProvider>
    </>
  );
}
