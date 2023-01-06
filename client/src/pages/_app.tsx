import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Axios from 'axios'
import { AuthProvider } from '../context/auth'; //context로 사용하기 위해서 감싸기
import { useRouter } from 'next/router';
import NavBar from '../components/NavBar';
import { SWRConfig } from 'swr'; //fetcher이 반복되므로 여기에 정리함
import axios from 'axios';
import { GlobalStyle  } from "../styles/global-style";
//import {Axios} from 'axios' 로 쓸경우에는 export defalut 일경우만 사용가능
export default function App({ Component, pageProps }: AppProps) {
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api"; //next.js의 경우 환경변수 NEXT_PUBLIC 사용
  Axios.defaults.withCredentials = true; //axios 할때마다 쿠키가 없기 때문에 여기에 적음
  //프론트단에서만으로 안돼므로 백엔드에서도 처리해줘야함 cookie-parser설치 및 이용! -Dependency 에러가 날경우 npm 설치시 맨뒤에 -f 를 붙여준다/ 설치 후 server.ts에 추가하기
  
  const {pathname} = useRouter();
  const authRoutes = ["/register", "/login"];
  const authRoute = authRoutes.includes(pathname); //회원가입과 로그인을 pathname에 포함시킨다!
  const fetcher = async (url: string) => {
      try {
          const res = await axios.get(url);
          return res.data;
      } catch (error: any) {
          throw error.response.data;
      }
  }
  return (
    <>
    <script defer src="https://use.fontawesome.com/releases/v5.15.4/js/all.js" integrity="sha384-rOA1PnstxnOBLzCLMcre8ybwbTmemjzdNlILg8O7z1lUkLXozs4DHonlDtnE7fpc" crossOrigin="anonymous"></script>
    <SWRConfig value={{ fetcher }}> 
      {/* 함수사용시는 한번더 감싸기 */}
        <AuthProvider>
          <GlobalStyle/>
          {!authRoute && <NavBar/>}   {/* 로그인과 회원가입페이지 아닐경우 navbar 나타내기 */}
          <div className={authRoute? "" :"md:pt-12 bg-gray-200 min-h-screen"}> {/* 로그인페이지와 회원가입 페이지일 경우 패딩없을애고 나머지는 패딩값주기 */}
            <Component {...pageProps} />
          </div>
        </AuthProvider>
      </SWRConfig>
    </>
  )
}

// 렌더링 하는 값은 모든 페이지에 영향을 줍니다.

/**
 * Component, pageProps를 받습니다.
여기서 props로 받은 Component는 요청한 페이지입니다. GET / 요청을 보냈다면, Component 에는 /pages/index.js 파일이 props로 내려오게 됩니다.
pageProps는 페이지 getInitialProps를 통해 내려 받은 props들을 말합니다.
그 다음 _document.tsx가 실행됨
 */