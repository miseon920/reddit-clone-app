import axios from 'axios'
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react'
import  useSWR  from 'swr';
import PostCard from '../../components/PostCard';
import SideBar from '../../components/SideBar';
import { useAuthState } from '../../context/auth';
import { Post } from '../../types';

const SubPage = () => {
    const [ownSub, setOwnSub] = useState(false); //본인의 커뮤니티인지 아닌지 확인하기 위해 만듬
    const { authenticated, user } = useAuthState();
    
    // const fetcher = async (url: string) => {
    //     try {
    //         const res = await axios.get(url);
    //         return res.data;
    //     } catch (error: any) {
    //         throw error.response.data;
    //     }
    // }

    const router = useRouter();
    const subName = router.query.sub; //상세페이지 제목이 됨 = 상세페이지 url
    const { data: sub, error, mutate } = useSWR(subName ? `/subs/${subName}` : null);
    console.log('sub',sub) // imageUrl을 볼수있음

        //파일첨부 - ref를 사용하여 dom 선택
    const fileInputRef = useRef<HTMLInputElement>(null);
    /**
     * ref를 사용하는경우
     * 1.엘리먼트 크기를 가져와야할때
     * 2.스크롤바 위치를 가져와야 할때
     * 3.엘리먼트에 포거스 설정을 줘야할때 등
     * 
     * fileInputRef.current => ref를 선택할때 / ref이름.current로 적음
     */


    //아바타 클릭시 파일첨부가 클릭되게 하기
    const uploadImage = async(event:ChangeEvent<HTMLInputElement>) => {
        if (event.target.files === null) return;
        const file = event.target.files[0];
        console.log('file', file);
       
        //파일을 백엔드에 보내기
        const formData = new FormData(); //FormData인터페이스는 양식 필드와 해당 값을 나타내는 키/값 쌍 집합을 쉽게 구성할 수 있는 방법을 제공하며, 그런 다음 or 메서드를 사용하여 쉽게 보낼 수 fetch()있습니다
        formData.append('file', file); //객체 내부의 기존 키에 새 값을 FormData추가하거나 아직 존재하지 않는 경우 키를 추가합니다.
        formData.append('type', fileInputRef.current!.name); //fileInputRef.current가 null이 아닌것이 분명하기 때문에 타입에러가 날시에 !을 붙인다.

        try { //백엔드에 넘겨주기!
            await axios.post(`subs/${sub.name}/upload`, formData, { //파일경로와 타입과 이름을 보냄
                headers: {"Context-Type":"multipart/form-data"} //context타입도 같이 보내줘야함
            })
        } catch (error) {
            console.log(error);
            
        }

    }
    const openFileInput = (type: string) => {  //이타입에 배너인지 이미지 인지 들어감
        //본인의 커뮤니티일경우만 바꾸게 하기 위해서 상태값을 비교해서 리턴시킴

        const fileInput = fileInputRef.current;  
        if (fileInput) { 
            fileInput.name = type; //배너 or 이미지로 타입을 정함
            fileInput.click();
        }
    }

    //포스트리스트 뿌리기
    let renderPosts;
    if (!sub) {
        renderPosts = <p className='text-lg text-center'>로딩중...</p>
    } else if (sub.posts.length === 0) {
        renderPosts = <p className='text-lg text-center'>아직 작성된 포스트가 없습니다.</p>
    } else { //포스트가 있을경우 배열로 담기므로 map 사용 
        renderPosts = sub.posts.map((post: Post) => (
            <PostCard key={post.identifier} post={post} subMutate={mutate} />
        ))
    }

    useEffect(() => {  //sub 이 있을때만하기위해 []안에 sub를 적어줌
        if (!sub || !user) return;
        setOwnSub(authenticated && user.username === sub.username);
        //유저 정보가 확실히 있을경우를 알때에는  uthenticated && user!.username 으로 적어줘도되지만 알수없으므로 위와 같이함
    },[sub])
  return (
      <>
          {sub && //sub가 있을경우
          <>
              <div>
                  {/*input이 있지만 보이지 않게 하기 위해 */}
                  <input type="file" hidden={true} ref={fileInputRef} onChange={uploadImage} /> 
                  {/* 배너 이미지 */}
                  <div className='bg-gray-400'>
                      {sub.bannerUrl ? (
                          <div className="h-56" style={{
                              backgroundImage: `url(${sub.bannerUrl})`,
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                          }}
                              onClick={()=>openFileInput("banner")}
                          >
                              
                          </div>
                      ): (
                        <div className='h-20 bg-gray-400'  onClick={()=>openFileInput("banner")}></div>      
                      ) }
                  </div>
                  {/* 커뮤니티 메타 데이터 */}
                  <div className="h-20 bg-white">
                      <div className="relative flex max-w-5xl px-5 mx-auto">
                          <div className="absolute" style={{ top: -15 }}>
                              {sub.imageUrl && (  //imageUrl이 있을경우
                                  <Image
                                      src={sub.imageUrl}
                                      alt="커뮤니티 이미지"
                                      width={70}
                                      height={70}
                                      className="rounded-full"
                                      onClick={()=>openFileInput("image")}
                                  />
                              )
                              }
                          </div>
                          <div className="pt-1 pl-24">
                              <div className="flex items-center">
                                  <h1 className='text-3xl font-bold'>{ sub.title}</h1>
                              </div>
                               <p className="text-small font-bold text-gray-400">
                              /r/{sub.name}
                          </p>
                          </div>
                         
                      </div>
                  </div>
              </div>    
              {/*포스트와 사이드바  */}
              <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
                  <div className="w-full md:mr-3 md:w-8/12">
                      {/* 리스트 뿌리기 */}
                      {renderPosts}
                  </div>
                  <SideBar sub={sub} />
              </div>
          </>
          }
      </>
  )
}

export default SubPage


/**
 * 상세페이지의 이름이 다양하게 들어갈 경우 []안에 적어줘야함 * 
 */