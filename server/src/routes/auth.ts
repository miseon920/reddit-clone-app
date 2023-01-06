import bcrypt from 'bcryptjs';
import { isEmpty, validate } from "class-validator";
import { Router,Request,Response } from "express";
import {User} from "../entities/User";
import  jwt from 'jsonwebtoken';
import cookie from 'cookie';
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";


const mapError = (errors: Object[]) => {
    return errors.reduce((prev:any,err:any)=>{ //reduce 누적되어 합해지는값
        prev[err.property] = Object.entries(err.constraints)[0][1] //Object.entries = 배열안에 키와 값을 배열로 만들어서 새로 배치함
        return prev;
    },{}) //초기 벨류값은 비어있음
}


//me 핸들러
const me = async(_:Request,res:Response) =>{ //Request를 안쓸경우 req가 아니라 _라 대체함
    return res.json(res.locals.user); //user middleware에서 넣어준값 = res.locals.user
}

//회원가입
const regiter =async (req:Request, res:Response) => { //regiter 핸들러
    //Request은 받은정보 Response는 프론트로 보낼 정보
    const {email,username,password} = req.body; // const email = req.body.email 과같음, 3개전부다 반복해야 하므로 왼쪽과 같이 한꺼번에 적음
    //console.log('email',email);

    try {
        let errors: any = {}; //에러들을 객체로 만듬 타입은 any

        //이메일과 유저이름이 이미 사용되고 있는지 확인하기
        const emailUser = await User.findOneBy({email});
        const usernameUser = await User.findOneBy({username});

        //이미 있다면 errors 객체에 넣어줌
        if(emailUser) errors.email = "이미 해당 이메일 주소가 사용되었습니다."
        if(usernameUser) errors.username = "이미 이 사용자 이름이 사용되었습니다."

        //에러가 있다면 return으로 에러를 rsponse 보내줌
        if(Object.keys(errors).length > 0){
            return res.status(400).json(errors);   
        }

        //위의 에러가 없을경우 저장하기
        const user = new User();
        user.email = email;
        user.username = username;
        user.password = password;

        //엔티티에 정해놓은 조건으로 user 유효성 검사를 해줌
        errors = await validate(user);
        //엔티티 유저에 정의 해둔 조건을 검사함
        if(errors.length > 0) return res.status(400).json(mapError(errors));
       
        //유저 정보를 user table에 저장
        await user.save();
        return res.json(user);

    } catch (error) {
        console.error(error);
        return res.status(500).json({error});
    }
} 

//로그인
const login = async (req:Request, res:Response) => {
    const {username,password} = req.body;
    try {
        let errors:any = {}
        //비워져 있다면 프론트엔드로 보내기
        if(isEmpty(username)) errors.username = "사용자 이름은 비워둘 수 없습니다.";
        if(isEmpty(password)) errors.password = "비밀번호는 비워둘 수 없습니다.";

        if(Object.keys(errors).length > 0){ //위에 에러가 하나라도 있다면
            return res.status(400).json(errors);
        }

        //디비에서 유저찾기
        const user = await User.findOneBy({username});
        if(!user) return res.status(404).json({username: '등록된 사용자가 아닙니다.'})

        //유저가 있다면 비밀번호 비교하기
        const passwordMatches = await bcrypt.compare(password,user.password);
        //bcrypt : 패스워드 해싱 함수/암호화 함수로 가장 강력한 해시 매커니즘중 하나
         // 비밀번호가 다르다면 에러 보내기
        // if (!passwordMatches) {
        //   return res.status(401).json({ password: "비밀번호가 잘못되었습니다." });
        // }
        //비밀번호가 맞을경우 토큰생성
        const token = jwt.sign({username},process.env.JWT_SECRET)
        //npm i jsonwebtoken dotenv cookie --save 설치
        //npm i --save-dev @types/jsonwebtoken @types/cookie
        //JWT_SECRET은 env파일과 맞춰야 함

        //쿠키저장
        //쿠키의 이름과 같은 항상 인코딩 해야함
        //쿠키 하나가 차지하는 용량은 최대 4kb까지이며 사이트 하나당 약 20여개를 허용하나 브라우저마다 차이가 있음
        res.set("Set-Cookie",cookie.serialize("token",token,{
            httpOnly:true,
            maxAge: 60*60*24*7, //1주일
            path:  "/",
        }));
        // * 네트워크 - 로그인 네임 - 헤더스를 보면 쿠키로 토큰이 들어간것을 확인 할수 있다.
        //  * 어플리케이션 쿠키를 보면 아무것도 없을 경우 쿠키옵션을 주지 않아 생기는 문제 / https://ko.javascript.info/cookie
        //  * 
        //  * httpOnly - 이옵션은 클라이언트측 스크립트 쿠키를 사용할 수 없게 한다. document.cookie를 통해 쿠키를 볼 수도 없고 조작할 수도 없음
        //  * secure - https에서만 쿠키를 사용할수 있게함
        //  * samesite - 요청이 외부에서 일어날때 브라우저가 쿠키를 보내지못하도록 막음 /XSRF공격은 막는대 유용함 
        //  * expires/max-age
        return res.json({user,token})
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
}

//logout 핸들러
const logout = async (_:Request,res:Response) => {
    res.set( //백엔드에서 쿠키 만료시키기
        "Set-Cookie", //Set-Cookie라는 헤더를 전송하여 쿠키를 설정
        cookie.serialize("token","",{
            httpOnly:true,
            secure:process.env.NODE_ENV === "production",
            sameSite:"strict", //쿠키 사용을 명시적으로 선언
            expires: new Date(0), //바로 만료시키기 
            path:"/",
        })
        /**
         * cookie.serialize(name, value, options)
         * NODE_ENV 는 익스프레스 서버의 노드 환경을 나타내는 환경 변수 - 일반적으로 개발 또는 프로덕션을 지정
         * sameSite 특성을 도입하면 특성을 지정하지 않도록 선택하거나 Strict 또는 Lax를 사용하여 쿠키를 same-site 요청으로 제한할 수 있습니다.
           SameSite를 Strict으로 설정하면 쿠키가 자사 컨텍스트에서만 전송됩니다. 
           사용자 측면에서 쿠키는 해당 사이트가 현재 브라우저의 URL 표시줄에 표시된 사이트와 일치하는 경우에만 전송됩니다 
           Strict는 사용자가 수행하는 작업과 관련된 쿠키에 유용합니다.
           최상위 탐색과 함께 쿠키를 보낼 수 있게 하는 SameSite=Lax가 바로 이 경우 / 어떤 SameSite 특성도 지정하지 않고 쿠키를 보내면 브라우저는 SameSite=Lax가 지정된 것처럼 처리합니다.        
           SameSite=None을 Secure 특성과 쌍으로 구성해야 합니다.
           
           */
    );
    //프론트단에 보내기
    res.status(200).json({success:true});
}

const router = Router();
router.get("/me",userMiddleware,authMiddleware,me);
router.post("/register",regiter); ///register로 올경우 regiter 핸들러를 사용
router.post("/login",login);
router.post("/logout",userMiddleware,authMiddleware,logout);
export default router;

