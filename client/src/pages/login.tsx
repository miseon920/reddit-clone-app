import Link from "next/link";
import React, { FormEvent, useState } from "react"
import InputGrop from "../components/InputGrop";
import axios from 'axios';
import { useRouter } from "next/router";
import { useAuthDispatch, useAuthState } from "../context/auth";

const Login = () => {
  let router = useRouter();
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [errors,setErrors] = useState<any>({}); //에러가 여러개 이므로 
  const {authenticated} = useAuthState(); //로그인한 사람일 때 - 배열항목을 가져올때 {항목}으로 씀
  const dispatch = useAuthDispatch(); //context로 만든 것 가져오기

    //console.log("authenticated : "+authenticated);
    //로그인한 사람일 때
    if(authenticated) router.push("/");

  const handleSubmit = async (event:FormEvent) => {
    event.preventDefault();
    try {
        const res = await axios.post("/auth/login", { password, username },{ withCredentials: true })
        dispatch("LOGIN",res.data?.user);////로그인성공후 user context에 저장됨
        router.push("/"); //메인으로 이동!
    } catch (error:any) {
        console.error(error);
        setErrors(error.response?.data || {});
    }
    }
  return (
     <div className="bg-white">
            <div className="flex flex-col items-center jusify-center h-screen p-6">
                <div className="w-10/12 mx-auto md:w-96">
                    <h1 className="mb-2 text-lg font-medium">로그인</h1>
                    <form action="" onSubmit={handleSubmit}>
                        <InputGrop
                            placeholder="Username"
                            value ={username}
                            setValue={setUsername}
                            error={errors.username}
                        />
                        <InputGrop
                            placeholder="Password"
                            value ={password}
                            setValue={setPassword}
                            error={errors.password}
                        />
                        <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gary-400 rounded">로그인</button>
                    </form>
                   <small>
                        아직 아이디가 없나요? 
                        <Link href="./register">
                            <span className="ml-1 text-blue-500 uppercase">회원가입</span>
                        </Link>
                   </small>
                </div>
            </div>
        </div>
  )
}

export default Login

//withCredentials:true
/**
 * 로그인시 아이디와 비밀번호가 서버로 넘어오면 유저의 정보가 맞는지 검사 후 쿠키에 토큰을
 * 발급하게 되며 다른페이지에 있더라도 이 토큰을 통해 인증이 이루어진다.
 * 하지만 백엔드와 프론트의 주소가 다른경우(포트나 도메인) 에러 없이 인증이 이루어지지않는다.
 * 도메인주소가 다를시 쿠키가 전송되지 않기 때문이다.
 * 이를 해결하기 위해서 프론트에서 axios요청을 보낼때 withCredentials를 설정하며 
 * 백엔드 cros부분에 credentials true롤 한 후 
 * 리스판스 헤더에  Access-Control-Allow-Ocredentials을 설정해 준다.
 * 
 */