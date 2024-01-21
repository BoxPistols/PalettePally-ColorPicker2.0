import type { AppProps } from 'next/app'
import createCache from '@emotion/cache'
import { CacheProvider, ThemeProvider } from '@emotion/react'
import { theme } from '@/lib/theme'
import Head from 'next/head'
import { ElementType } from 'react'
import '../src/styles/globals.css'

export default function App({
  Component,
  pageProps,
}: AppProps<{ Component: ElementType }>) {
  const cache = createCache({ key: 'css', prepend: true, stylisPlugins: [] })
  cache.compat = true

  return (
    <>
      <ThemeProvider theme={theme}>
        <CacheProvider value={cache}>
          <Head>
            <meta name='description' content='this is content' />
            <meta
              name='viewport'
              content='width=device-width, initial-scale=1'
            />
            <link rel='icon' href='/favicon.ico' />
          </Head>
          <Component {...pageProps} />
        </CacheProvider>
      </ThemeProvider>
    </>
  )
}
