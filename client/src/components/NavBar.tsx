import React from 'react'
import Link from 'next/link'
import { useAuthDispatch, useAuthState } from '../context/auth'
import axios from 'axios';
import Image from 'next/image'
import { FaSearch } from 'react-icons/fa';

const NavBar = () => {
  const {loding,authenticated} = useAuthState();
  const dispatch = useAuthDispatch(); //콘텍스트에 있는 LOGOUT 반영하기위해 디스패치로 가져옴

  //로그아웃 기능만들기
  const handleLogout = () => {
    //토큰을 날려주면됨
    axios.post("/auth/logout") //백엔드로 요청을 보냄
    //백엔드에서 완료 후 콘텍스트에 있는 LOGOUT 반영하기 
    .then(()=>{
        dispatch("LOGOUT"); //dispatch로 가져온것 실행하기
        window.location.reload();
    })
    .catch((error)=>{
        console.log(error);
    })
  }

  return (
    <div className='fixed inset-x-0 top-0 z-10 md:flex items-center justify-between md:h-10 px-5 bg-white py-5 md:py-0'>
        <span className='text-2xl font-semibold text-gray-400'>
            <Link href="/">
                  <span className='flex items-center'>
                      <Image
                          src="/reddit_main.svg"
                          alt="logo"
                          width={30}
                          height={30}
                          className="inline-block mr-3"
                      />
                      <Image
                          src="/reddit.svg"
                          alt="logo"
                          width={60}
                          height={20}
                          className="inline-block"
                      />
                  </span>      
            </Link>
        </span>
        <div className="max-w-full md:px-4 py-5 md:py-0">
              <div className="relative flex items-center by-gray-100 border rounded hover:bg-white">
                <FaSearch className='ml-2 text-gray-400'/>
                <input type="text" placeholder='검색' className='h-7 px-3 py-1 bg-transparent rounded focus:outline-none text-xs' />
            </div>
        </div>
        <div className="flex">
            {!loding && (
                authenticated? (
                    //로그인일경우
                    <button className='w-20 mr-2 text-cetner text-white bg-gray-400 rounded h-7 text-xs' onClick={handleLogout}>로그아웃</button>
                ):(
                    //비회원일경우
                    <>
                        <Link href="/login">
                            <span className='w-30 px-2 pt-1 mr-2 text-center text-blue-500 border border-blue-500 rounded block h-7 text-xs'>로그인</span>
                        </Link>
                        <Link href="/register">
                            <span className='w-30 px-2 pt-1 text-center border border-gray-400 rounded block h-7 text-xs'>회원가입</span>
                        </Link>
                    </>
                )
            )}
        </div>
    </div>
  )
}

export default NavBar