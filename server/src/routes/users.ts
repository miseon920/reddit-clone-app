import { Router,Request,Response } from 'express';
import Comment from '../entities/Comment';
import Post from '../entities/Post';
import { User } from '../entities/User';
import userMiddleware from "../middlewares/user";
//import authMiddleware from "../middlewares/auth";

const getUserData = async(req:Request,res:Response) => { 
   try {
    //유저 정보 가져오기
       const user = await User.findOneOrFail({
           where: { username: req.params.username },
           select:["username","createdAt"]           
       })

       //유저가 쓴 포스트 정보 가져오기
       const posts = await Post.find({
           where: { username: user.username },
           relations: ["comments", "votes", "sub"]
           //relations에서 comments, votes 를 넣어 준 이유 : Post 엔티티에서 commentCount의 this.comments와 voteScore의 this.votes를 가져오기 위해서
           //적지않을 경우 Post를 찍어보면 commentCount,voteScore 가 undefined가 뜸
       })

       //유저가 쓴 댓글 정보 가져오기
       const comments = await Comment.find({
           where: { username: user.username },
           relations:["post"]
       })

       if (res.locals.user) { //좋아요 싫어요 부분
           const { user } = res.locals;
           posts.forEach(p => p.setUserVote(user));
           comments.forEach(c => c.setUserVote(user));
       }
       // 데이터 정보 만들기
       let userData: any[] = [];

       //정보 넣어주기
       posts.forEach(p => userData.push({ type: "Post", ...p.toJSON() }));
       comments.forEach(c => userData.push({ type: "Comment", ...c.toJSON() }));
       /**
        * 스프레드 연산자로 복사해주기 - https://paperblock.tistory.com/62 - 원본배열은 두고 새로운 복사배열을 생성 할 수 있음
        * 스프레드 연산자로 새로운 객체를 복사할때 인스턴스 상태로 하면 엔티티에서 Expose 를 이용한 getter는 들어가지 않게된다 
        * 따라서 객체로 바꾼 후 복사해 주어야 하므로 toJson을 사용하여 바꿔줌
        * toJSON() 은 JSON형식의 데이터로 변환하기 위해 사용 (=직렬화: Serialization)해주는 코드
        * 클래스의 객체를 JSON형식의 데이터로 변환해 주어야 getter 부분도 복사가 된다
        */

        //최신 정보가 먼저오게 졍렬
       userData.sort((a, b) => { 
           if (b.createdAt > a.createdAt) return 1;
           if (b.createdAt < a.createdAt) return -1;
           return 0;
       })

       return res.json({ user, userData });
   } catch (error) {
       console.log(error);
       return res.status(500).json({ error: "문제가 발생했습니다." });
   }
}

const router = Router();
router.get("/:username", userMiddleware, getUserData);

export default router