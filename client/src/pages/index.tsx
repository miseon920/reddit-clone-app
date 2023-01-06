import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import  useSWR  from 'swr';
import { Sub } from '../types';
import axios from 'axios';
import { useAuthState } from '../context/auth';
import { Post } from "../types";
import useSWRInfinite from "swr/infinite";
import PostCard from '../components/PostCard';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

// const Plist = styled.div`
//     padding-top:0;
//     @media (max-width: 768px) {
//        padding-top:100px;
//     }
//  `
const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { authenticated } = useAuthState();
  const fetcher = async (url: string) => { 
   return await axios.get(url).then(res=>res.data)
  } //화살표 함수 뒤에 {}감싸주지 않을경우에는 return 생략가능
  /**
   * Fetcher는 서버에서 데이터를 조회하는 모듈로,
   *  서버에서 데이터를 조회해 로컬 스토리지(데이터베이스나 전역 변수)에 저장하고,
   *  View와 로컬 스토리지를 연결(binding)해 주는 역할을 합니다.
   * Fetcher를 활용하면, 한 번 로딩한 콘텐츠는 다음에는 로딩 없이 곧바로 나타납니다.
   * Fetcher를 활용하면, 한 번 로딩한 콘텐츠는 네트워크에 연결되어 있지 않아도 표시됩니다.
   */
  const address = "/subs/sub/topSubs"
  
  const getKey = (pageIndex: number, previousPageData: Post[]) => { 
    if (previousPageData && !previousPageData.length) return null;//맨끝에 도달했을때 - 더이상 가져올데이터가 없으므로
    //가져올 데이터가 있다면
    return `/posts?page=${pageIndex}`; //경로지정 해주기
  }

  const { data, error, size: page, setSize: setPage, isValidating, mutate } = useSWRInfinite<Post[]>(getKey);
  //console.log(data);
  /**
   * useSWRInfinite
   * 각페이지의 swr 키를 얻기 위한 함수
   * fetcher에 의해 허용된 값을 반환
   * null이 반환된다면 페이지의 요청은 시작되지않음
   * 
   * #반환값
   * data : 각페이지의 가져오기 응답 값 배열
   * error: useSWR의 error과 동일
   * isValidating: useSWR의 isValidating 동일
   * mutate : useSWR의 바인딩 된 뮤테이트 함수와 동일 하지만 데이터 배열을 다름
   * size: 가져올 페이지 및 반환 될 페이지수
   * setSize: 가져와야하는 페이지 수를 결정
   */

  //포스트 불러오기
  const isInitialLoading = !data && !error; //데이터가 없을때 즉 로딩상태일때
  const posts: Post[] = data ? ([] as Post[]).concat(...data) : []; //concat(...data) data를 더해줌! data가 없을시에는 빈 배열을 반환하고 있다면 더해주기!
  //[].concat(...data)로 적으면 타입에러가 나오므로 무조건 Post라는 타입을 가지는 것이므로 위와 같이 바꿔줌

  const { data: topSubs } = useSWR<Sub[]>(address, fetcher);
  /**
   * stale-while-revalidate 약자로 데이터를 가져오기 위한 리액트 훅 라이브러리이다.
   * swr은 원격데이터를 가져올때 캐싱된 데이터가 있으면 그 데이터를 먼저 반환(stale)한 다음 가져오기
   * 요청(revalidate)을 보내고 마지막으로 최신 데이터와 함께 제공하는 라이브러리이다.   
   * 먼저 있는 데이터를 반환하고 요청한것을 캐싱하므로 속도면에서 매우 빠르다.
   *  useSWR hook은 key 문자열과 fetcher 함수를 받습니다. 
   * key는 데이터의 고유한 식별자이며(일반적으로 API URL) fetcher로 전달될 것입니다.//여기서는 address가 키가 됨
   *  fetcher는 데이터를 반환하는 어떠한 비동기 함수도 될 수 있습니다. 
   * 네이티브 fetch 또는 Axios와 같은 도구를 사용할 수 있습니다. (GraphQL 사용가능)
     hook은 두 개의 값을 반환합니다: 요청의 상태에 기반한 data와 error.
  */
  
  //무한스크롤
  const [observedPost, setObservedPost] = useState("");
  /**
    Intersection_Observer / 인털섹션 옵절브 

    브라우저 뷰포트와 설정한 요소의 교차점을 관찰하며
    요소가 뷰포트에 포함되는지 포함되지 않는지, 더쉽게는 사용자 화면에 지금 보이는 요소인지 아닌지 구별하는 기능을 제공
    비동기적으로 실행되기 때문에 scroll같은 이벤트 기반의 요소 관찰에서 발생하는 렌더링 성능이나 이벤트 연속 호출 등을 문제없이 사용할 수 있다.

    포스트를 계속 불러오기 위해 사용함!
   */
  useEffect(() => {
    //포스트가 없다면 return
    if (!posts || posts.length === 0) return;
    //posts배열에 마지막 post의 id를 가져온다
    const id = posts[posts.length - 1].identifier; //인덱스 번호는 0번부터라서 총갯수에서 -1해준것
    //posts 배열에 post가 추가되어 마지막 post가 바뀌었다면 바뀐 post중 마지막 post를 observedPost 로 정해주기

    if (id !== observedPost) {
      setObservedPost(id);
      observeElement(document.getElementById(id));
    }
  }, [posts]);
  

  const observeElement = (element: HTMLElement | null) => {
    if (!element) return;
    // 브라우저 뷰포트(ViewPort)와 설정한 요소(Element)의 교차점을 관찰
    const observer = new IntersectionObserver( 
      //생성자를 호출하고 임계값이 한 방향 또는 다른 방향으로 교차할 때마다 실행되는 콜백 함수를 전달하여 교차 관찰자를 만듭니다.
      // entries는 IntersectionObserverEntry 인스턴스의 배열
      (entries) => {
        // isIntersecting: 관찰 대상의 교차 상태(Boolean)
        if (entries[0].isIntersecting === true) {
          console.log("마지막 포스트에 왔습니다.");
          setPage(page + 1);
          observer.unobserve(element);
        }
      },
      { threshold: 1 } //1.0은 옵션으로 지정된 요소 내에서 대상의 100%가 표시될 때 root콜백이 호출됨을 의미/ 100분율로 나오면 0.25의 경우는 4분의 1 보일때 true로 바뀜
    );
    // 대상 요소의 관찰을 시작
    observer.observe(element);
  }
  //https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

  return (
    <div className='flex max-w-5xl px-4 mx-auto'>
      {/* 포스트리스트 */}
      <div className="w-full md:mr-3 md:w-8/12 main_list"> {/* md:mr-3 md:w-8/12은 반응형 */}
          {isInitialLoading && <p className='text-lg text-center'>로딩중입니다.</p>}
          {posts?.map(post => (
            <PostCard key={post.identifier} post={post} mutate={mutate} />
          ))}
      </div>
      {/* 사이드바 */}
      <div className="hidden w-4/12 ml-3 md:block"> {/* 작을때는 안보이고 미디엄보다 커지면 블럭처리됨 */}
        <div className="bg-white border rounded">
          <div className="p-4 border-b">
            <p className="text-lg font-semibold text-center">상위 커뮤니티</p>
          </div>
          {/* 커뮤니티 리스트 */}
          <div>
            {topSubs?.map((sub) => (
              <div key={sub.name} className="flex item-center px-4 py-2 text-xs border-b">
                <Link href={`/r/${sub.name}`}>
                  <span>
                    <Image
                      src={sub.imageUrl}
                      className="rounded-full cursor-pointer"
                      alt="Sub"
                      width={24}
                      height={24}
                    />
                    {/* 이미지를 보여줄수 있게 허용해 주어야함 next.config.js 에서 허용시켜줘야함 */}
                    </span>
                </Link>
                <Link href={`/r/${sub.name}`}>
                  <span className='ml-2 font-bold hover:cursor-pointer'>
                    /r/{ sub.name}
                  </span>
                </Link>
                <p className='ml-auto font-medium'>{sub.postCount}</p>
              </div>
            )) }
          </div>
          {/* 커뮤니티 리스트 end */}
          {authenticated && //로그인 했을시만 버튼 보이게 하기
            <div className="w-full py-6 text-center">
              <Link href="/subs/create">
                <span className='w-full p-2 text-cetner text-white bg-gray-400 rounded'>커뮤니티만들기</span>
              </Link>
            </div>
          }
        </div>   
      </div>
    </div>
    // <>
    //   <Head>
    //     <title>Create Next App</title>
    //     <meta name="description" content="Generated by create next app" />
    //     <meta name="viewport" content="width=device-width, initial-scale=1" />
    //     <link rel="icon" href="/favicon.ico" />
    //   </Head>
    //   <main className={styles.main}>
    //     <h1 className='text-3xl font-bold underline'>hello</h1>
    //     {/* <div className={styles.description}>
    //       <p>
    //         Get started by editing&nbsp;
    //         <code className={styles.code}>pages/index.tsx</code>
    //       </p>
    //       <div>
    //         <a
    //           href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
    //           target="_blank"
    //           rel="noopener noreferrer"
    //         >
    //           By{' '}
    //           <Image
    //             src="/vercel.svg"
    //             alt="Vercel Logo"
    //             className={styles.vercelLogo}
    //             width={100}
    //             height={24}
    //             priority
    //           />
    //         </a>
    //       </div>
    //     </div>

    //     <div className={styles.center}>
    //       <Image
    //         className={styles.logo}
    //         src="/next.svg"
    //         alt="Next.js Logo"
    //         width={180}
    //         height={37}
    //         priority
    //       />
    //       <div className={styles.thirteen}>
    //         <Image
    //           src="/thirteen.svg"
    //           alt="13"
    //           width={40}
    //           height={31}
    //           priority
    //         />
    //       </div>
    //     </div>

    //     <div className={styles.grid}>
    //       <a
    //         href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <h2 className={inter.className}>
    //           Docs <span>-&gt;</span>
    //         </h2>
    //         <p className={inter.className}>
    //           Find in-depth information about Next.js features and&nbsp;API.
    //         </p>
    //       </a>

    //       <a
    //         href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <h2 className={inter.className}>
    //           Learn <span>-&gt;</span>
    //         </h2>
    //         <p className={inter.className}>
    //           Learn about Next.js in an interactive course with&nbsp;quizzes!
    //         </p>
    //       </a>

    //       <a
    //         href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <h2 className={inter.className}>
    //           Templates <span>-&gt;</span>
    //         </h2>
    //         <p className={inter.className}>
    //           Discover and deploy boilerplate example Next.js&nbsp;projects.
    //         </p>
    //       </a>

    //       <a
    //         href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
    //         className={styles.card}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //       >
    //         <h2 className={inter.className}>
    //           Deploy <span>-&gt;</span>
    //         </h2>
    //         <p className={inter.className}>
    //           Instantly deploy your Next.js site to a shareable URL
    //           with&nbsp;Vercel.
    //         </p>
    //       </a>
    //     </div> */}
    //   </main>
    // </>
  )
}

/**
 * Tailwind CSS IntelliSense 확장파일을 깔아서 tailwind에 해당 클래스가 있는지 없는지 확인할 수 있음
 * 
 * 
 * 
 * #############배포하기
 * 
 * ###배포전 client 부분 수정하기
 * #배포시 aws ce2 이용하기
 * https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04 
 * sudo systemctl status docker 까지 설치하기!
 * 
 * env를 개발환경과 배포환경에 맞게 따로 사용하기 위해 설치
 * npm i env-cmd --save
 * 
 * package.json에 배포환경일때 와 개발환경일때 스크립트 변경하기
 * 
 * pm2 모듈 사용을 위해 ecosystem.config.js 만들기
 * 
 * 배포시에 그냥 올리면 이미지가 에러나므로 설치
 * //npm i sharp --save
 *  * 
 * 
 * 로컬로 적은 것들 환경변수로 바꾸기 url 등
 * 
 * next.config.js 도메인에 localhost와 배포할 서버주소 넣기
 * 
 * ###배포전 server부분 수정하기
 *  * npm i env-cmd --save
 * 설치 후 env 파일 변경하기
 * 
 *package.json에 배포환경일때 와 개발환경일때 스크립트 변경하기
 *pm2 모듈 사용을 위해 ecosystem.config.js 만들기
 * 
  * 로컬로 적은 것들 환경변수로 바꾸기 url 등
 * */