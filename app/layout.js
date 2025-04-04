import './globals.css';
//import ChatButton from './components/ChatButton';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Hama - 합리적인 엄마의 스마트한 선택</title>
        <meta 
          name="description" 
          content="Hama는 소비자 맞춤형 육아용품을 추천하고 소비패턴을 분석해주는 서비스입니다." 
        />
      </head>
      <body>
        <main>{children}</main>
        {/* <ChatButton /> */}
      </body>
    </html>
  );
}