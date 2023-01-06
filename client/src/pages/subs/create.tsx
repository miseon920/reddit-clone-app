
import axios from 'axios'; 
import Router from 'next/router';
import React, { FormEvent, useState } from 'react'
import InputGrop from "../../components/InputGrop";
import {GetServerSideProps} from "next";

function SubCreate() {
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<any>({});

    const handleSubmit = async(event:FormEvent)=>{
        event.preventDefault();
        try {
            const res = await axios.post("/subs",{name,title,description})
            Router.push(`/r/${res.data.name}`);
        } catch (error:any) {
            console.log(error);
            setErrors(error.response.data);
            //console.log(error.response.data); 찍어보고 서버단과 형식 맞춰주기
        }
    }
  return (
    <div className='flex flex-col justify-center pt-16'>
        <div className="w-10/12 mx-auto md:w-96 bg-white rounded p-4">
            <h1 className="mb-2 text-lg font-medium">
                커뮤니티 만들기
            </h1>    
            <hr />
            <form action="" onSubmit={handleSubmit}>
                <div className="my-6">
                    <p className="font-medium">Name</p>
                    <p className="mb-2 text-xs text-gray-400">
                        커뮤니티 이름은 변경할 수 없습니다.
                    </p>
                    <InputGrop 
                        placeholder='이름'
                        value={name}
                        setValue={setName}
                        error={errors.name}
                    />
                </div>
                <div className="my-6">
                    <p className="font-medium">Title</p>
                    <p className="mb-2 text-xs text-gray-400">
                       주제를 나타냅니다. 언제든지 변경할 수 있습니다.
                    </p>
                    <InputGrop 
                        placeholder='제목'
                        value={title}
                        setValue={setTitle}
                        error={errors.title}
                    />
                </div>
                <div className="my-6">
                    <p className="font-medium">Description</p>
                    <p className="mb-2 text-xs text-gray-400">
                        해당 커뮤니티에 대한 설명입니다.
                    </p>
                    <InputGrop 
                        placeholder='설명'
                        value={description}
                        setValue={setDescription}
                        error={errors.description}
                    />
                </div>
                <div className="flex justify-end">
                    <button className='px-4 py-1 text-sm font-semibold rounded text-white bg-gray-400 border'>
                        커뮤니티 만들기
                    </button>
                </div>
            </form>
        </div>    
    </div>
  )
}

export default SubCreate
//https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props
export const getServerSideProps: GetServerSideProps = async({req,res})=>{
    try {
        const cookie = req.headers.cookie;
        //쿠키가 없다면 에러보내기
        if(!cookie) throw new Error("토큰 쿠기가 없습니다.");
        
        //쿠키가 있다면 그 쿠키를 이용하여 백엔드에서 인증처리하기
        await axios.get("/auth/me",{headers:{cookie}});

        return {props:{}}
    } catch (error) {
        //백엔드요청에서 던져준 쿠키를 이용하여 인증할때 에러가 날 경우 로그인페이지로 이동
        //비회원일 경우 로그인페이지로 튕김
        res.writeHead(307,{location:"/login"}).end(); //307은 임시적으로 url을 옮기는것
        return {props:{}}
    }
}
/**
 * 페이지에서 (Server-Side Rendering) 라는 함수를 내보낼 때 getServerSidePropsNext.js는
 * 에서 반환된 데이터를 사용하여 각 요청에서 이 페이지를 미리 렌더링합니다
 * getServerSideProps. 이는 자주 변경되는 데이터를 가져오고
 * 최신 데이터를 표시하도록 페이지를 업데이트하려는 경우에 유용합니다.
 * getServerSideProps 모듈을 import 한후
 * 클라이언트 측에 제공되지 않으며 데이터베이스에서 데이터를 가져오는 것을 포함한
 * 서버측 코드를getServerSideProps 작성할 수 있습니다.
 * 
export async function getServerSideProps(context) {
  return {
    props: {}, // will be passed to the page component as props
  }
}
위의 형식으로 쓰며 리턴된 props 값이 없을경우 비워둔다.
값이 있다면 키-값 으로 써주면된다. ex)props: { message: `Next.js is awesome` },
 */