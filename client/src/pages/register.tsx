import Link from "next/link";
import React, { FormEvent, useState } from "react"
import InputGrop from "../components/InputGrop";
import axios from 'axios';
import { useRouter } from "next/router";
import { useAuthState } from "../context/auth";

const Register = () =>{
    const [email,setEmail] = useState("");
    const [username,setUsername] = useState("");
    const [password,setPassword] = useState("");
    const [errors,setErrors] = useState<any>({}); //에러가 여러개 이므로 객체로저장

    //로그인한 사람의 경우에는 메인으로 튕기기
    let router = useRouter();
    const {authenticated} = useAuthState();
    if(authenticated) router.push("/");

    const handleSubmit = async (event:FormEvent) => { //이벤트 타입이 폼이벤트!
        event.preventDefault();
        try{
            const res = await axios.post('/auth/register',{ //비동기 통신을 위하여 async await 사용 , 값을 가져올때는 get을 쓰나 가져오는게 아니므로 그냥씀
                ///auth/register의 경우 
                email, //키와 벨류가 같은경우 하나로 쓸수 있음
                username,
                password
            }) 
            console.log('res',res);
            router.push('/login'); //성공시 push메소드를 이용하여 경로 변경
        }catch(error:any){
            console.error(error);
            setErrors(error.response?.data || {});
        }
    }
    return(
        <div className="bg-white">
            <div className="flex flex-col items-center jusify-center h-screen p-6">
                <div className="w-10/12 mx-auto md:w-96">
                    <h1 className="mb-2 text-lg font-medium">회원가입</h1>
                    <form action="" onSubmit={handleSubmit}>
                        <InputGrop
                            placeholder="Email"
                            value ={email}
                            setValue={setEmail}
                            error={errors.email}
                        />
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
                        <button className="w-full py-2 mb-1 text-xs font-bold text-white uppercase bg-gray-400 border border-gary-400 rounded">회원가입</button>
                    </form>
                   <small>
                        이미가입하셨나요? 
                        <Link href="./login">
                            <span className="ml-1 text-blue-500 uppercase">로그인</span>
                        </Link>
                   </small>
                </div>
            </div>
        </div>
    )

}

export default Register;