import Document, { Html, Head, Main, NextScript } from 'next/document';

// Web Font
export const WebFont = () => {
  return (
    <>
      <link rel='preconnect' href='https://fonts.googleapis.com' />
      <link
        rel='preconnect'
        href='https://fonts.gstatic.com'
        // ↑↓推奨パフォーマンス対策 crossorigin default=anonymous
        crossOrigin='anonymous'
      />
      {/* TODO: fix-lint */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        // INFO: display:swap=フォント読み込み待機時間中は代替フォントで先に表示させる。 他指定："optional"=もし待ってフォントが来なければWebフォント自体を読まない。
        href='https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Noto+Sans+JP:wght@400;500;700&display=swap'
        rel='stylesheet'
      />
    </>
  );
};

class MyDocument extends Document {
  render() {
    return (
      <Html lang='ja'>
        <Head>
          {/* Favicon */}
          <link rel='icon' href='/favicon.ico' sizes='32x32' />
          <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
          <link rel='apple-touch-icon' href='/favicon.svg' />
          {/* Manifest */}
          <link rel='manifest' href='/site.webmanifest' />
          <meta name='theme-color' content='#3f50b5' />
          {/* OGP */}
          <meta property='og:title' content='Pallett Pally' />
          <meta property='og:description' content='MUI 互換カラーパレット生成ツール - Material You ベース' />
          <meta property='og:type' content='website' />
          <meta property='og:locale' content='ja_JP' />
          {/* Twitter Card */}
          <meta name='twitter:card' content='summary' />
          <meta name='twitter:title' content='Pallett Pally' />
          <meta name='twitter:description' content='MUI 互換カラーパレット生成ツール' />
          <WebFont />
          {/* <style>
            {` .MuiSvgIcon-root { opacity: 0; transition: opacity 0.3s; }
            .MuiSvgIcon-root.fontLoaded { opacity: 1; } `} </style> */}
        </Head>
        <body>
          <Main />
          <NextScript />
          {/* <script
            dangerouslySetInnerHTML={{
              __html: `
                document.fonts.ready.then(function () {
                  const icons = document.querySelectorAll('.MuiSvgIcon-root');
                  icons.forEach((icon) => {
                    icon.classList.add('fontLoaded');
                  });
                });
              `,
            }}
          /> */}
        </body>
      </Html>
    );
  }
}
export default MyDocument;
