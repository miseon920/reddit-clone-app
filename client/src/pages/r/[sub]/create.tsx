import axios from 'axios';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import React, { FormEvent, useState } from 'react'
import { Post } from '../../../types';

//import Post from "post"

const PostCreate = () => {
    const [title, setTitle] = useState(""); //타이틀
    const [body, setBody] = useState(""); //내용
    //console.log(title,body)

    const router = useRouter();
    const { sub: subName } = router.query; //본인 서브의 이름에서 서브를 가져온것

    const submitPost = async(e : FormEvent) => { 
        e.preventDefault();
        if (title.trim() === "" || !subName) return;  //공백일경우 - trim() 메서드는 문자열 양 끝의 공백을 제거하고 원본 문자열을 수정하지 않고 새로운 문자열을 반환합니다. / sub는 서브의 이름임/ 본인커뮤니티 이름

        try {
            const { data: post } = await axios.post<Post>("/posts", {
                title: title.trim(),
                body,
                sub: subName
            })
            router.push(`/r/${subName}/${post.identifier}/${post.slug}`);
            //console.log('aa',post.identifier,'ddd',post.slug);
             //상세페이지로 이동
        } catch (error) {
            console.log(error);
        }
    }
  return (
      <div className='flex flex-col justify-center pt-16'>
          <div className="w-10/12 mx-auto md:w-96">
              <div className='p-4 bg-white rounded'>
                  <h1 className='mb-3 text-lg'>포스트 생성하기</h1>
                  <form action="" onSubmit={submitPost}>
                      <div className="relative mb-2">
                          <input type="text" className='w-full px-3 border border-gray-300 rounded focus:outline-none focus:border:border-blue-500' placeholder='제목' maxLength={20}
                              value={title}
                              onChange={(e)=> setTitle(e.target.value)}
                          />
                          <div className="absolute mb-2 text-sm text-gray-400 select-none" style={{top:5,right:10}}>
                              {title.trim().length}/20
                          </div>                    
                      </div>
                      <textarea rows={4} placeholder="설명" className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border:border-blue-500'
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                      ></textarea>
                      <div className="flex justify-end">
                          <button className='px-4 py-1 text-sm font-semibold text-white bg-gray-400 border rounded'>생성하기</button>
                      </div>
                  </form>
            </div>
          </div>  
    </div>
  )
}

export default PostCreate

//로그인한 유저가 아닐경우
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => { 
    try {
        const cookie = req.headers.cookie;
        if (!cookie) throw new Error("쿠키가 없습니다.")
        
        //쿠키가 있다면
        await axios.get("/auth/me", { headers: { cookie } });
        return { props: {} }
    } catch (error) {
        res.writeHead(307, { Location: "/login" }).end()
        return { props: {} }
    }

}