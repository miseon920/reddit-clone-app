import { useRouter } from 'next/router'
import Link from 'next/link';
import Image from 'next/image'
import React from 'react'
import useSWR from 'swr';
import PostCard from '../../components/PostCard';
import { Comment, Post } from '../../types';
import dayjs from 'dayjs';

const UserPage = () => {
    const router = useRouter();
    const username = router.query.username;

    const { data, error } = useSWR<any>(username?`/users/${username}`: null); //username있으면 요청 보내고 없으면 null
    if (!data) return null;
  return (
    <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
          {/*유저 포스트 댓글 리스트 */}
          <div className='w-full md:mr-3 md:w-8/12'>
              {data.userData.map((data:any) => { 
                  if (data.type === 'Post') {
                      const post: Post = data;
                      return <PostCard key={post.identifier} post={post} />
                  } else { 
                      const comment: Comment = data;
                      return (
                          <div key={comment.identifier} className="flex my-4 bg-white rounded">
                              <div className='flex-shrink-0 w-10 py-10 text-center rounded-l border-r'>
                                  <i className="text-gray-500 fas fa-comment-alt fa-xs"></i>
                              </div>
                              <div className="w-full p-2">
                                  <p className='mb-2 text-xs text-gray-500'>
                                      <Link href={`/u/${comment.username}`}>
                                        <span className='cursor-pointer hover:underline'>
                                            {comment.username}
                                        </span>
                                      </Link>{" "}
                                      {/* 어떤 게시물에 코멘트가 달렸는지 */}
                                      <span>commented on</span>
                                      <Link href={`${comment.post?.url}`}>
                                          {/* 코멘트가 있는 포스트가 있을때만 가져오기 위해 ?를 붙임 */}
                                        <span className='cursor-pointer font-semibold hover:underline'>
                                             ???{comment.post?.title}
                                        </span>
                                      </Link>{" "}
                                      <span>●</span>{" "}
                                      <Link href={`/r/${comment.post?.subName}`}>
                                          {/* 코멘트가 있는 포스트가 있을때만 가져오기 위해 ?를 붙임 */}
                                        <span className='cursor-pointer text-black hover:underline'>
                                             {comment.post?.subName}
                                        </span>
                                      </Link>
                                  </p>
                                  <hr />
                                  <p className='p-1'>{comment.body}</p>
                              </div>
                          </div>
                      )
                  }  
              })}
          </div> 
          {/* 유저정보 */}
          <div className='hidden w-4/12 ml-3 md:block'>
              <div className="flex items-center p-3 bg-gray-400 rounded-t text-left">
                  <Image
                      src="https://www.gravatar.com/avatar/0000?d=mp&f=y"
                      alt="user profile"
                      className="border border-white rounded-full"
                      width={40}
                      height={40}
                  />
                  <p className="pl-2 text-md">{data.user.username}</p>
              </div>
              <div className='bg-white rounded-b p-3'>
                  <p>
                      {dayjs(data.user.createdAt).format("YYYY년 MM월 DD일")} 가입
                  </p>
              </div>
          </div>
    </div>
  )
}

export default UserPage