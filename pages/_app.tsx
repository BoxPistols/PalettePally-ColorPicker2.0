import type { AppProps } from 'next/app'
import createCache from '@emotion/cache'
import { theme } from '@/lib/theme'
import Head from 'next/head'
import '../src/styles/globals.css'
import { ThemeProvider, CacheProvider } from '@emotion/react'

export default function App({ Component, pageProps }: AppProps) {
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
