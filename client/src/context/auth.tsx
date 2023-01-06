import axios from "axios";
import { createContext, useContext, useEffect, useReducer } from "react";
import { User } from "../types"; //User가 가진 정보에 대한 타입이 담겨있음

//State type
interface State{
    authenticated: boolean;
    user:User | undefined;
    loding: boolean
}

//Context 만듬
const StateContext = createContext<State>({
    authenticated:false, //인증유무 - 인증후에 true로 바뀜
    user:undefined, //유저정보
    loding:true //인증상태
})

//유저의 정보를 업데이트하거나 인증유무를 업데이트 구현 // StateContext를 업데이트함
const DispatchContext = createContext<any>(null);

interface Action{ //action타입만들기
    type:string;
    payload: any;
    //type: "액션의 종류를 한번에 식별할 수 있는 문자열 혹은 심볼", payload: "액션의 실행에 필요한 임의의 데이터",
}
const reducer = (state:State,{type,payload}: Action)=>{
     //state의 타입은 위의 State의 타입을 쓰고 type과 payload의 타입은 위의 action타입을 타입으로 이용하겠다는 뜻
     //reducer : 이전 상태와 Action을 합쳐, 새로운 state를 만드는것
    //3가지 상황이 있으므로 스위치문으로 돌림
    switch(type){
        case "LOGIN":
            return{
                ...state,
                authenticated:true,
                user:payload
            }
        case "LOGOUT":
            return{
                ...state,
                authenticated:false,
                user:null
            }
        case "STOP_LODING":
            return{
                ...state,
               loding:false
            }
        default: //switch문에서 디폴트는 꼭 써줘야함
            throw new Error(`Unknown action type: ${type}`)
    }
}

export const AuthProvider = ({children}:{children:React.ReactNode})=>{ //children은 컴포넌트가 됨 - 타입적은것
    //usestate가 반복되므로 리듀서(useReducer)로 관리함 
    const [state , defaultDispatch] = useReducer(reducer,{ //위의 reducer 함수 적은것
        user:null,
        authenticated: false,
        loding:true
    })
    
    //확인하기
    //console.log('state',state);

    const dispatch = (type:string,payload?:any)=>{
        defaultDispatch({type,payload});
    }

    useEffect(()=>{
        //로그인한 회원의 경우 로그인 페이지를 보여주면 안돼므로 작업
        async function loadUser () {
            try { //저정보를 가져오기
                const res = await axios.get("/auth/me");
                dispatch("LOGIN",res.data);  //로딩을 false로 바꿈          
            } catch (error) {
                console.log(error);
            }finally{ //에러든 유저정보를 가져왔든지 
                dispatch("STOP_LODING");
            }
        }
        loadUser();
    },[])
    return(
        <DispatchContext.Provider value={dispatch}>  
        {/*DispatchContext를 사용하기 위해서 provider로 감싼것 / dispatch는 위의 dispatch를 사용하겠다고한것 */}
            <StateContext.Provider value={state}>{children}</StateContext.Provider> 
            {/*StateContext를 사용하기위해 provider로 감싼것  */}
        </DispatchContext.Provider>        
    )
}

//다른곳에서 사용할수 있게 export 함
export const useAuthState = () =>useContext(StateContext);
export const useAuthDispatch = () =>useContext(DispatchContext);


/**
 * authenticated의 약자에서 따온 컴포넌트 이름 / auth!
 * 스테이트를 관리하기 위한 상태관리
 * 모든컴포넌트에서 가져올수 있는 value 생성
 * 1)유저정보 인증여부 - StateContext
 * 2)유저의 정보를 업데이트하거나 인증유무를 업데이트 구현 - DispatchContext
 * 3)Context에 있는 value를 다른 컴포넌트에서 사용할 수 있기 위해서는 Context Provider로 감싸주어야 한다
 * 4) StateContext Provider value에 넣어줄 값과 DispatchContext Provider value에 넣어줄 값 구하기
 */