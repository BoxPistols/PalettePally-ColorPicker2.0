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
          <link rel='icon' href='/favicon.ico' />
          {/* <link rel="preload" href="https://fonts.googleapis.com/icon?family=Material+Icons" as="font" crossOrigin="anonymous" /> */}
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
