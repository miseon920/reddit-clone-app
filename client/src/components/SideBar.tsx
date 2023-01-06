import React from 'react'
import { useAuthState } from '../context/auth'
import { Sub } from '../types';
import Link from 'next/link';
import dayjs from 'dayjs';

type Props = {
    sub:Sub
}

//우측 사이드바 내용
function SideBar({ sub }:Props) {
    const {authenticated} = useAuthState();
  return (
      <div className='hidden w-4/12 ml-3 md:block'>
          <div className="bg-white border rounded">
              <div className="p-3 bg-gray-400 rounded-t">
                  <p className='font-semibold text-white'>커뮤니티에 대해서</p>
              </div>
              <div className="p-3">
                  <p className='mb-3 text-base'>
                      {sub?.description}                      
                  </p>
                  <div className='flex mb-3 text-sm font-medium'>
                      <div className="w-1/2">
                          <p>100</p>
                          <p>멤버</p>
                      </div>
                  </div>
                  <p className="my-3">{dayjs(sub?.createdAt).format(`YYYY년 MM월 DD일`)}</p>
                  {authenticated && ( //로그인한경우
                      <div className='mx-0 my-2'>
                          <Link href={`/r/${sub.name}/create`}>
                            <span className='w-full p-2 text-sm text-white bg-gray-400 rounded'>포스트 생성</span>
                          </Link>
                   </div>   
                  )}
              </div>
          </div>
    </div>
  )
}

export default SideBar

/**
 * createdAt 이 2022-12-22T23:31:15.086Z 나오는대 원하는 날짜 형태로 나오게 하기위해서 dayjs 사용
 * npm i dayjs --save 설치
 * 
 */