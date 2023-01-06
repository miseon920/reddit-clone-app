import React from 'react'
import { Post } from "../types";
import { FaArrowUp,FaArrowDown} from "react-icons/fa"
import Link from 'next/link';
import Image from 'next/image';
import dayjs from 'dayjs';
import { useAuthState } from '../context/auth';
import { useRouter } from 'next/router';
import axios from 'axios';

interface PostCardProps { 
    post: Post,
    subMutate?:()=>void //함수이므로 리턴값이 없으므로 타입으로 void를 적음
    mutate?:()=>void
}

const PostCard = ({
    post: { //Post에서 내려줄것을 props로 내려줄것 적기
        identifier,
        title,
        slug,
        body,
        subName,
        username,
        createdAt,
        updatedAt,
        sub,
        url,
        userVote,
        voteScore,
        commentCount
    },
    mutate,
    subMutate
}: PostCardProps) => {
    const router = useRouter();
    const { authenticated } = useAuthState();
    const isInSubPage = router.pathname === '/r/[sub]'; 
    //메인에서는 보여주고 리스트에서는 안보이게 하기위해서 
    //console.log('router.pathname',router.pathname);
    const vote = async(value:number) => { 
        if (!authenticated) return router.push("/login");
        if (value === userVote) { 
            value = 0;
        }
        try {
            await axios.post("/votes", { identifier, slug, value });
            if(mutate) mutate();
            if(subMutate) subMutate();
        } catch (error) {
            console.log(error);
        }
    }
  return (
      <div className='flex mb-4 bg-white rounded' id={identifier}>
          {/* 좋아요 싫어요 기능부분 */}
        <div className="flex-shrink-0 w-10 py-2 text-center rounded-1">
            {/* 좋아요 */}
            <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
             onClick={()=> vote(1)}
            >
                {/* <i className={classNames("fas fa-arrow-up", {
                    "text-red-500":post.userVote === 1   //좋아요(1)일때 해당클래스 붙여주기
                })}></i> */}
                {userVote === 1 ?
                    <FaArrowUp className='text-red-500' /> :
                    <FaArrowUp />                                        
                }
                
            </div>
            <p className="text-xs font-bold">{voteScore}</p>
            {/* 싫어요 */}
            <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
             onClick={()=> vote(-1)}
            >
                {userVote === -1 ?
                    <FaArrowDown className='text-blue-500' /> :
                    <FaArrowDown />                                        
                }       
                {/* <i className={classNames("fas fa-arrow-down", {
                    "text-blue-500":post.userVote === -1   //싫어요(-1)일때 해당클래스 붙여주기
                })}></i> */}

            </div>
        </div>
          {/*포스트데이터 부분  */}
          <div className="w-full p-2">
              <div className="flex items-center">
                  {!isInSubPage && (
                    <div className='flex items-center'>
                        <Link href={`/r/${subName}`}>
                            <span>
                                {/* {sub &&
                                    <Image
                                        src={sub?.imageUrl}
                                        alt="sub"
                                        className="rounded-full cursor-pointer"
                                        width={12}
                                        height={12}
                                    />
                                } */}
                                    <Image
                                        src={sub!.imageUrl}
                                        alt="sub"
                                        className='rounded-full cursor-pointer'
                                        width={12}
                                        height={12}
                                    />
                                </span>
                        </Link>
                        <Link href={`/r/${subName}`}>
                            <span className='ml-2 text-xs font-bold cursor-pointer hover:underline'>/r/{subName}</span>
                        </Link>
                        <span className='mx-l text-xs text-gray-400'>●</span>
                    </div>                      
                  ) }
                    <p className="text-xs text-gray-400">
                        Posted by
                        <Link href={`/u/${username}`}>
                            <span className="mx-1 hover:underline">/u/{username}</span>
                        </Link>
                        <Link href={url}>
                            <span className="max-1 hover:underline">
                                {dayjs(createdAt).format("YYYY년 MM월 DD일 HH:mm")}
                            </span>
                        </Link>
                    </p>
                </div>
                <Link href={url}>
                    <span className="my-1 text-lg font-medium">{title}</span>
                </Link>
                {body && <p className='my-1 text-sm'>{body}</p>}
                <div className="flex">
                    <Link href={url}>
                        <span>
                            <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                            <span>{commentCount}</span>
                        </span>
                    </Link>
               </div>
          </div>
      </div>
  )
}

export default PostCard