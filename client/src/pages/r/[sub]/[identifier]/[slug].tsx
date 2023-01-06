import axios from 'axios';
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'
import { Post, Comment } from '../../../../types'
import useSWR from 'swr'
import Link from 'next/link'
import dayjs from 'dayjs'
import { useAuthState } from '../../../../context/auth';
import classNames from "classnames"
import { FaArrowUp,FaArrowDown} from "react-icons/fa"

const PostPage = () => {
    const router = useRouter();
    const { identifier, sub, slug } = router.query;
    const { data: post, error,mutate:postMutate } = useSWR<Post>(identifier && slug ? `/posts/${identifier}/${slug}` : null);
    const { authenticated, user } = useAuthState();
    //comment 
    const [newComment, setNewComment] = useState("");
    //코멘트 가져오기
    const { data: comments, mutate:commentMutate } = useSWR<Comment[]>(
        //mutate=뮤테이트 는 리프레시없이 바로 댓글을 가져오기 위해서 사용함 - 캐시된 데이터를 갱신하기 위한 함수
        identifier && slug ? `/posts/${identifier}/${slug}/comments` : null //identifier&&slug가 있다면 해당경로로 요청하기
    );
    //const { data: post, error,mutate } 이런식으로 mutate를 같게 주면 에러가 발생한다 2번정의 되었기 때문에 따라서 destructuring 할당 할때 상수명을 따로준다
    //Destructuring 할당 구문은 배열 의 값 또는 개체의 속성을 개별 변수로 압축해제할 수 있게 해주는 JavaScript 표현식입니다.
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    const handleSubmit = async(e:FormEvent) => { 
        e.preventDefault();
        if (newComment.trim() === "") { 
            return;
        }

        try {
            await axios.post(`/posts/${post?.identifier}/${post?.slug}/comments`, { //보낸 경로로 api 만들어주기,post로 보냈기 때문에 받을때도 post
                body:newComment //백엔드에 보내기 
            })
            commentMutate();
            setNewComment(""); //보낸후 비워줌
        } catch (error) {
            console.log(error);
        }
    }
    //console.log('코멘트',comments);

    //좋아요 싫어요 함수
    const vote = async (value:number,comment?:Comment) => { //comment?는 게시글에서는 없고 댓글에만 있으므로/ 있을수도있고 없을수도 있기 때문
        //로그인안했을때
        if (!authenticated) router.push("/login");

        //이미 같은 버튼을 클릭했을경우 (또클릭하려고할때) reset
        if (
            (!comment && value === post?.userVote) || //코멘트가없지만 벨류와 유저의 투표와 같을때 ->포스트가 있을때로 바꿔도됨
            (comment && comment.userVote === value)){ //코멘트가 있을때 코멘트의 유저투표와 벨류가 같을때
                value = 0 // 벨류를 0으로 만듬 / 같은것을 또 클릭할경우 취소한것이나 마찬가지이므로
            }
        try { //백엔드에 보내기
            await axios.post("/votes", {
                identifier,
                slug,
                commentIdentifier: comment?.identifier, //댓글의 identifier
                value
            })
            postMutate();
            commentMutate();
        } catch (error) {
            console.log(error);
        }

     }
  return (
      <div className='flex max-w-5xl px-4 pt-5 mx-auto'>
          <div className="w-full md:mr-3 md:w-8/12">
              <div className="bg-white rounded">
                  {post && (
                      <>
                        {/*포스트  */}
                          <div className="flex">
                              {/* 좋아요 싫어요 기능부분 */}
                              <div className="flex-shrink-0 w-10 py-2 text-center rounded-1">
                                  {/* 좋아요 */}
                                  <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                    onClick={()=> vote(1)}
                                  >
                                      {/* <i className={classNames("fas fa-arrow-up", {
                                          "text-red-500":post.userVote === 1   //좋아요(1)일때 해당클래스 붙여주기
                                      })}></i> */}
                                      {post.userVote === 1 ?
                                          <FaArrowUp className='text-red-500' /> :
                                          <FaArrowUp />                                        
                                      }
                                      
                                  </div>
                                  <p className="text-xs font-bold">{post.voteScore}</p>
                                  {/* 싫어요 */}
                                   <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                    onClick={()=> vote(-1)}
                                  >
                                      {post.userVote === -1 ?
                                          <FaArrowDown className='text-blue-500' /> :
                                          <FaArrowDown />                                        
                                      }       
                                      {/* <i className={classNames("fas fa-arrow-down", {
                                          "text-blue-500":post.userVote === -1   //싫어요(-1)일때 해당클래스 붙여주기
                                      })}></i> */}

                                  </div>
                              </div>
                              <div className="py-2 pr-2">
                                  <div className="flex items-center">
                                      <p className='text-xs text-gray-400'>
                                          Posted by
                                          <Link href={`/u/${post.username}`}>
                                              <span className="mx-1 hover:underline">
                                                  /u/{post.username}
                                              </span>
                                          </Link>
                                          <Link href={post.url}>
                                              <span className='mx-1 hover:underline'>
                                                  {dayjs(post.createdAt).format("YYYY년 MM월 DD일 HH:mm") }
                                              </span>
                                          </Link>
                                      </p>
                                  </div>
                                  <h1 className='my-1 text-xl font-medium'>{post.title}</h1>
                                  <p className="my-3 text-sm">{post.body}</p>
                                  <div className="flex">
                                      <button>
                                          <i className="mr-1 fas fa-comment-alt fa-xs"></i>
                                          <span className="font-bold">
                                              {post.commentCount} Comments
                                          </span>
                                      </button>
                                  </div>
                              </div>      
                          </div>
                          <div>
                              {/* 댓글 작성 구간 */}
                              <div className="pr-6 py-4 pl-9">
                                  {authenticated ? (
                                    <div>
                                          <p className="mb-1 text-xs">
                                              <Link href={`/u/${user?.username}`}>
                                                  <span className='font-semibold text-blue-500'>{ user?.username}</span>
                                              </Link>
                                              {""}으로 댓글 작성
                                          </p>
                                          <form action="" onSubmit={handleSubmit}>
                                              <textarea
                                                  className='w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-gray-600'
                                                  onChange={e => setNewComment(e.target.value)}
                                                  value={newComment}
                                              >
                                              </textarea>
                                              <div className="flex justify-end">
                                                  <button
                                                      className='px-3 py-1 text-white bg-gray-400 rounded'
                                                      disabled={newComment.trim() === ""} //아무것도 적지 않았을경우 비활성화시키기
                                                  >댓글작성</button>
                                              </div>
                                          </form>
                                    </div>
                                  ): ( //비로그인
                                    <div className='flex items-center justify-between px-2 py-4 border border-gray-200 rounded'>
                                        <p className='font-semibld text-gray-400'>
                                            댓글 작성을 위해서 로그인을 해주세요.           
                                        </p>
                                        <div>
                                            <Link href={`/login`}>
                                                <span className="px-3 py-1 text-white bg-gray-400 rounded">로그인</span>      
                                            </Link>
                                        </div> 
                                    </div> 
                                  ) }
                              </div>
                              {/* 댓글 리스트 부분 */}
                              { comments?.map(comment => (
                                  <div className='flex' key={comment.identifier}>
                                      {/* 좋아요 싫어요 부분 */}
                                      <div className="flex-shrink-0 w-10 py-2 text-center rounded-1">
                                        {/* 좋아요 */}
                                        <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-red-500"
                                            onClick={()=> vote(1, comment)}
                                        >
                                            {/* <i className={classNames("fas fa-arrow-up", {
                                                "text-red-500":comment.userVote === 1   //좋아요(1)일때 해당클래스 붙여주기
                                            })}></i> */}
                                              {comment.userVote === 1 ?
                                                    <FaArrowUp className='text-red-500' /> :
                                                    <FaArrowUp />                                        
                                                }
                                        </div>
                                        <p className="text-xs font-bold">{comment.voteScore}</p>
                                        {/* 싫어요 */}
                                        <div className="flex justify-center w-6 mx-auto text-gray-400 rounded cursor-pointer hover:bg-gray-300 hover:text-blue-500"
                                            onClick={()=> vote(-1,comment)}
                                        >
                                            {/* <i className={classNames("fas fa-arrow-down", {
                                                "text-blue-500":comment.userVote === -1   //싫어요(-1)일때 해당클래스 붙여주기
                                            })}></i> */}
                                              {comment.userVote === -1 ?
                                                    <FaArrowDown className='text-blue-500' /> :
                                                    <FaArrowDown />                                        
                                                }      
                                        </div>
                                      </div>
                                      {/* real list */}
                                      <div className='py-2 pr-2'>
                                          <p className="mb-1 text-xs leading-none">
                                              <Link href={`/u/${comment.username}`}>
                                                  <span className="mr-1 font-bold hover:underline">
                                                      {comment.username}
                                                  </span>
                                              </Link>
                                              <span className="text-gray-600">
                                                  {`
                                                    ${comment.voteScore}
                                                    posts
                                                    ${dayjs(comment.createdAt).format("YYYY년 MM월 DD일 HH:mm")}
                                                  `}
                                              </span>
                                          </p>
                                          <p>{comment.body}</p>
                                      </div>
                                  </div>
                              ))} 
                          </div>
                      </>
                  )}
              </div>
          </div>
    </div>
  )
}

export default PostPage

//npm install react-icons --save 설치하기 폰트어썸에 문제로 인하여 리액트아이콘 사용하기