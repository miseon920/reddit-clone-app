import React from 'react'
import cls from 'classnames'; //npm i classnames --save  : {}안의 사항이 false일 경우 앞의 클래스가 먹힘 

//cls({'foo-bar':true}) - true면 foo-bar 찍힘
//cls({'foo-bar':false}) - false면 안찍힘
//https://chanhuiseok.github.io/posts/react-14/

interface InputGropProps{ //인터페이스나 타입으로 쓸수 있으면 인터페이스를 주로 사용하는것을 권장
    className?:string;
    type?:string;
    placeholder?:string;
    value:string;
    error:string | undefined;
    setValue: (str:string) => void; // 아무것도 리턴하지 않는다는 함수를 의미합니다.
} //기본값 설정
const InputGrop = ({
    className = "mb-2",
    type="text",
    placeholder="",
    error,
    value,
    setValue
}:InputGropProps) => { //props에 타입을 담아서 넘김  
  return (
    <div className={className}>
        <input 
        type={type}
        style={{minWidth:300}}
        className={cls(`w-full p-3 transition duration-200 border border-gray-400 rounded bg-gray-50 focus:bg-white over:bg-white`,{"border-red-500":error}
        )}
        //에러가 true면 border-red-500 찍힘
        placeholder={placeholder}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
    />
     <small className='font-medium text-red-500'>{error} </small>
    </div>
  )
}

export default InputGrop


//타입스크립트
//https://blog.naver.com/PostView.naver?blogId=pjt3591oo&logNo=222342618084&parentCategoryNo=&categoryNo=103&viewDate=&isShowPopularPosts=true&from=search
//https://react.vlpt.us/using-typescript/03-ts-manage-state.html  - 타입스크립트 설명