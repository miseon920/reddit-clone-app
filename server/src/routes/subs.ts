import { NextFunction } from 'express';
import Post from '../entities/Post';
import { User } from "../entities/User";
import { isEmpty } from 'class-validator';
import { Router,Request,Response } from 'express';
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { AppDataSource } from '../data-source';
import Sub from '../entities/Sub';
import multer, {FileFilterCallback} from 'multer';
import { makeId } from '../utils/helpers';
import path from 'path';
import { unlinkSync } from 'fs'; //fs는 파일 시스템의 약자

//상세페이지 - 커뮤니티 정보 전달
const getSub = async(req:Request,res:Response) => { 
    const name = req.params.name; //name을 가져오기 위해서 req.params 사용
    try {
        const sub = await Sub.findOneByOrFail({ name }); // 한개가 있거나 실패일때

        //포스트 생성 후 해당 sub에 속하는 포스트 정보 넣어주기
        const posts = await Post.find({
            where: { subName: sub.name },
            order: { createdAt: "DESC" },
            relations: ["comments", "votes"], //댓글과 투표부분
        })
        sub.posts = posts;


        //좋아요 위아래 투표 버튼 - 나중에 볼것
        if (res.locals.user) { 
           sub.posts.forEach((p) => p.setUserVote(res.locals.user));
        }
        console.log('sub', sub);
        return res.json(sub); //프론트단에 전달
    } catch (error) {
        return res.status(404).json({error: "커뮤니티를 찾을 수 없습니다."})
    }
}

//커뮤니티 글 만들기!
const createSub = async (req:Request, res:Response, next) => { //다음으로 넘겨야 하므로 next도 넣어줌
    const {name, title, description} = req.body;

    try {
        let errors: any = {};
        
        if (isEmpty(name)) errors.name = "이름은 비워둘 수 없습니다.";
        if (isEmpty(title)) errors.title = "제목은 비워두 수 없습니다.";

        //쿼리빌더를 이용하여 db에 있는 소스 가져오기
        const sub = await AppDataSource
        .getRepository(Sub)
        .createQueryBuilder("sub")
        .where("lower(sub.name) = :name", { name: name.toLowerCase() })
        .getOne();

        if(sub) errors.name = "서브가 이미 존재합니다.";
        if(Object.keys(errors).length > 0){ //에러가 있다면 에러던지기
            throw errors;
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }

    //서브 인스턴스 생성 후 데이터 베이스에 저장하기
    try {
        
        const user:User = res.locals.user;
        ////post로 값을 받아올 경우 일일이 변수에 할당해줘야함
        const sub = new Sub();
        sub.name = name;
        sub.description = description;
        sub.title = title;
        sub.user = user;

        await sub.save();
        
        //저장한 정보를 프론트엔드로 전달하기
        return res.json(sub);

    } catch (error) {
        console.log(error);
        return res.status(500).json({error : "문제가 발생했습니다."})
    }

    // //먼저 Sub를 생성할 수 있는 유저인지 체크(요청에서 보내준 토큰 확인)
    // const token = req.cookies.token;
    // if(!token) return next(); //토큰이 없을 경우 바로 넘기기

    // const {username}: any = jwt.verify(token, process.env.JWT_SECRET);
    // //인수로 서명을 확인하기 위한 키 , 일부 알고리즘별 매개변수, 서명 및 원래 서명된 데이터를 사용합니다. Promise서명이 유효한지 여부를 나타내는 boolen 값으로 충족되는 를 반환 합니다.
    // //verify(algorithm, key, signature, data)
    // const user = await User.findOneBy({username});
    // //유저정보가 없다면 throw error
    // if(!user) throw new Error("Unauthenticated");

    // //유저정보가 있다면 sub 이름과 제목이 이미 있는것인지 체크
    // //sub Interface 생성 후 데이터베이스에 저장
    // //저장한 정보 프론트엔드로 전송
}

const topSubs = async(req:Request,res:Response) => { 
    try {
        //const imageUrlExp = `COALESCE(s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`;    
        //위와 값이 쓰면 메인에서 imageUrl값이 현재 Urn으로 나오는 오류가 있으므로 Postgres에서 제공하는 Concatenate strings = 'Postgre' || 'SQL' 을 이용하여 바꿔준다. - 여기서는 || 이 또는이 아니라 합쳐준다는 의미
        const imageUrlExp = `COALESCE('${process.env.APP_URL}/images/' || s."imageUrn",'https://www.gravatar.com/avatar?d=mp&f=y')`; //결과값
        const subs = await AppDataSource
            .createQueryBuilder()
            .select(`s.title,s.name,${imageUrlExp} as "imageUrl",count(p.id) as "postCount"`)
            .from(Sub, "s")
            .leftJoin(Post, "p", `s.name = p."subName"`)
            .groupBy('s.title,s.name,"imageUrl"')
            .orderBy(`"postCount"`, "DESC")
            .limit(5)
            .execute();
        return res.json(subs);
    } catch (error) {
        console.log(error);
        return res.status(500).json({error:"문제가 발생했습니다."})
    }
}

//ownSub

const ownSub = async(req:Request,res:Response,next:NextFunction) => { 
    const user: User = res.locals.user; //미들웨어에서 정의 해줬기 때문에 사용할 수 있음

    try {
        const sub = await Sub.findOneOrFail({ where: { name: req.params.name } }); ///:name/upload 으로 받았기 때문에 params를 쓸 수 있으면 뒤에 name과 라우터의 네임과 맞춰줘야함
        if (sub.username !== user.username) {
            return res.status(403).json({ error: "이 커뮤니티를 소유하고 있지 않습니다." });
        }
        res.locals.sub = sub; //sub에서도 서브정보를 넣어준곳! 유저처럼
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: " 문제가 발생했습니다." });
    }
}
/**
 * #파일을 서버에 저장하기 위해 multer 미들웨어 설치
 * npm i multer --save
 * npm i --save-dev @types/multer  //타입을 위해서 설치
 */

//https://beagle-dev.tistory.com/30
const upload = multer({
    storage: multer.diskStorage({ //실제 로컬의 디스크에 파일을 저장
        destination: "public/images", //저장할 파일 위치
        filename: (_, file, callback) => { 
            const name = makeId(10); //고유하게 쓰기 위해 이전에 만들어둔 makeID로 지정
            callback(null, name + path.extname(file.originalname)); // file의 이름을 변경해서 저장 name은 위의 고유한것오로 만듬 파일이름 , 뒤에 path.extname(file.originalname)은 파일형식임
            //path.extname() 메서드는 파일 경로의 확장자를 반환합니다.
        },
        
    }),
    fileFilter: (_, file: any, callback: FileFilterCallback) => { 
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { //mimetype : 전송한 파일이 이미지 형식
            callback(null, true);
        } else { 
            callback(new Error("이미지가 아닙니다."));
        }
    }
})


//이미 저장되어 있는 이미지 삭제
const uploadSubImage =async (req:Request,res:Response) => {
    const sub: Sub = res.locals.sub;

    try {
        const type = req.body.type;
        //파일유형을 지정치 않았을 시에  업로드 된 파일 삭제
        if (type !== "image" && type !== "banner") { //이미지나 배너가 아닐경우  
            if (!req.file?.path) { //파일 경로가 없을시
                return res.status(400).json({ error: "잘못된 유형" });
            }
            //파일 지우기
            unlinkSync(req.file.path);
            return res.status(400).json({ error: "잘못된 유형" });
        }

        let oldImageUrn: string = "";

        if (type === "image") {
            //사용중인 urn 저장하기(이전파일을 삭제하기 위해)
            oldImageUrn = sub.imageUrn || "";
            //새로운 파일 이름을 Urn으로 넣기
            sub.imageUrn = req.file?.filename || "";
        } else if (type === "banner") { 
            oldImageUrn = sub.bannerUrn || "";
            sub.bannerUrn = req.file?.filename || "";
        }
        await sub.save(); //데이터베이스에 새로바뀐 이름 저장

        //사용하지 않는 이미지 파일 삭제
        if (oldImageUrn !== "") {  //이미지가 있을때 _ 방어코드
            const fullFilename = path.resolve( //경로 만들어주기
                process.cwd(),
                "public",
                "images",
                oldImageUrn
            );
            unlinkSync(fullFilename);
        }
        return res.json(sub);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const router = Router(); //router 인스턴스 생성
/**
 * URI(경로) 및 특정한 HTTP(Hyper Text Transfet Protocol) 요청 메소드(GET,POST)의 클라이언트 요청에 응답하는 방법을 결정
    각 라우트는 하나 이상의 핸들러 함수를 가질 수 있고, 라우트가 일치할 때 실행된다.
 */
router.post("/",userMiddleware,authMiddleware,createSub); //따로만든 미들웨어를 넣어준다.
router.get("/sub/topSubs", topSubs); //인증이 되지 않은 사람도 볼수 있으므로 미들웨어를 따로 넣어줄 필요가 없음
router.get("/:name", userMiddleware, getSub); //서브제목이 유동적으로 넘어오므로 name이라는 변수로 받겠다는 뜻
router.post("/:name/upload", userMiddleware, authMiddleware, ownSub, upload.single("file"), uploadSubImage); //이미지 업로드하는 부분
/**
 * https://victorydntmd.tistory.com/39
 * #파일 업로드 처리
  인자로 upload 객체의 single() 메서드를 호출했습니다.
  single() 메서드의 인자로는 form에서 파일을 넘겨주는 요소의 name 애트리뷰트인 file를 작성하면 됩니다.
  single() 메서드는 파일을 하나만 받으며, single() 메서드 이외에도 array(), fields() 등의 메서드가 있습니다.
  #파일 객체
  multer 미들웨어를 등록하면 요청 객체에 file 또는 files 객체가 추가된다고 했습니다.
  single() 메서드를 호출했기 때문에 req.file 객체에는 업로드된 파일의 정보가 담겨있습니다.
 * 
 */
export default router;

/**
 * 유저 정보 및 유저 등급에 따라 인증을 따로 해줘야함
 * 핸들러에서 유저정보를 필요하고 (User Middleware)
 * 유저의 정보나 유저의 등급에 따라서 인증을 따로 (Auth Middleware)
 * 여러곳에서 쓰이므로 재사용성을 위해 미들웨어로 분리해 준다.
 * 
 * get 같은 경우 URL에 parameter를 함께 보내 요청하지만, post는 request body에 parameter를 보내서 정보를 추출해야 한다.
 * #body-parser는 node.js 모듈로 클라이언트의 post request body로부터 파라미터를 추출할 수 있게 해주는 것
    이럴때 body-parser 미들웨어를 사용하면 간단하게 추출 가능하다.
    미들웨어란 클라이언트에서 req(요청),res(응답) 사이 중간(미들)에 위치하는 함수로, 요청과 응답 사이클에서 중간에 거쳐가는 함수들이라고 생각하면된다.
 */


    //https://dencode.com/ 인코딩 알아보는 사이트!