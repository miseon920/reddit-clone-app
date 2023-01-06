import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

//meta 태그를 정의하거나, 전체 페이지에 관려하는 컴포넌트입니다.
/**
 * // 모든페이지에 아래 메타테크가 head에 들어감 // 루트파일이기에 가능한
  적은 코드만 넣어야함 전역 파일을 엉망으로 만들면 안된다 // 웹 타이틀,
  ga 같은것 넣음
  이곳에서 console은 서버에서만 보이고 클라이언트에서는 안보입니다.
 */

  /**
   * import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { ServerStyleSheet } from "styled-components";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;
    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
     <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
    );
  }
}

export default MyDocument;
   * styled-component를 사용할 경우 커스텀이 필요하다.
https://styled-components.com/docs/advanced#nextjs
해당 코드를 추가해주어야 SSR시에 styled가 헤더에 주입된다.
추가해주지 않으면 CSS가 적용되지 않고 먼저 렌더링되는 현상이 발생한다.
생략부분에는 메타태그를 넣어주거나 웹폰트를 preload 시켜줄 수 있다.
https://been.tistory.com/m/56
   */