import express from "express";
import morgan from "morgan";
import { AppDataSource } from "./data-source";

import authRoutes from "./routes/auth";
import subRoutes from "./routes/subs"; //라우트 만든것을 임폴트하여 사용함
import postRoutes from './routes/posts';
import voteRoutes from './routes/votes';
import userRoutes from './routes/users';



import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";

// 미들웨어 셋팅
const app = express(); //app은 express 객체

/**
 * cros 에러 해결 
 * 서버쪽에  npm i cors --save 설치하여 해결함
 */
const orign = "http://localhost:3000"; //3000번과 4000번이 달라서 나타나는 현상 해결

app.use(cors({
    orign,
    credentials: true,
}))
//https://expressjs.com/en/resources/middleware/cors.html
//app.options('*', cors()) // include before other routes

//app.get( PATH(경로), HANDLER )
/**
 * METHOD에는 HTTP 요청 메소드로 GET, POST 방식이 있다
  PATH는 해당하는 프로젝트 내의 서버 경로
 HANDLER는 라우트가 일치할 때 발생하는 함수이다.
 * 
 */
app.use(express.json()); 
app.use(morgan("dev"));
app.use(cookieParser()); //cookie-parser 설치 후 실행시키기

dotenv.config(); //env파일을 사용하겠다는것! dotenv설치 후 작성

//라우팅
app.get("/",(_,res) => res.send("running"));
app.use("/api/auth",authRoutes);
app.use("/api/subs", subRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/votes", voteRoutes);
app.use("/api/users", userRoutes);


app.use(express.static("public")); //이미지 파일 올릴시 stacic(정적인) 파일을 public 파일안에 있고 브라우저 접근할때 제공할수 있게 하기 위해 적어줌

let port = 4000;
app.listen(port,async () => { //원하는 포트에 서버를 오픈하는 문법
    
    
    console.log(`server running at http://localhost:${port}`); //백쪽이라 터미널에 찍힘
    AppDataSource.initialize().then(async () => {

        console.log("Inserting a new user into the database...")
        
    
    }).catch(error => console.log(error))
})


/**
 * https://taltube.tistory.com/9
 * morgan
기존 로그 외에 추가적인 로그를 볼 수 있다. 요청과 응답에 대한 정보를 콘솔에 기록한다.
인수로 dev외에 combined, common, short, tiny 등을 넣을 수 있다.인수를 바꾸면 로그가 달라진다. 대체로 개발환경에서는 dev, 배포 환경에서는 combined를 사용한다.
 * 
 * 
 * https://nemne.tistory.com/15
 * 
 * 서버를 처음 실행 시키면 미들웨어 셋팅 부분이 동작한다.
그 후 '주소/'를 들어가게 되면 라우트 부분이 실행되고 다시 요청을 기다린다.
그러나 '주소/'가 아닌 다른 주소가 들어가면 라우트가 실행되지 않고 그 다음 코드인 에러처리가 동작하여 에러가 작동된다.
연결한 서버를 켜고 dev를 해야함!(도커 실행후)
 * */ 

