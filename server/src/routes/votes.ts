import { Router,Request,Response } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import { User } from "../entities/User";
import Post from "../entities/Post";
import Vote from "../entities/Vote";
import Comment from "../entities/Comment";
import { validateOrReject } from "class-validator";


const vote = async(req:Request,res:Response) => { 
    const { identifier, slug, commentIdentifier, value } = req.body;

    //-1,0,-1의 value만 오는지 체크
    if (![-1, 0, 1].includes(value)) { 
        return res.status(400).json({ value: "-1, 0, 1의 value만 올 수 있습니다." })
    }

    try { //데이터 베이스 작업
        const user: User = res.locals.user;
        let post: Post = await Post.findOneByOrFail({ identifier, slug }); //identifier, slug 를 이용하여 해당 게시물 찾기
        let vote: Vote | undefined; //투표가 없을수도 있으므로 undefined 추가하기
        let comment: Comment;

        if (commentIdentifier) {
            //댓글 식별자가 있는 경우 댓글 vote 찾기
            comment = await Comment.findOneByOrFail({ identifier: commentIdentifier }); //댓글의 Identifier로 찾기
            vote = await Vote.findOneBy({ username: user.username, commentId: comment.id }) //댓글의 유저네임과 아이디 찾기
        } else { 
            //포스트로 vote 찾기 - 댓글이 없는경우
            vote = await Vote.findOneBy({ username: user.username, postId: post.id });
        }

        if (!vote && value === 0) {
            //vote가 없고 value가 0(이미 같은 버튼을 눌렀을경우)일때
            return res.status(404).json({ error: "Vote를 찾을 수 없습니다." });
        } else if (!vote) { //vote가없을때 - 이제 버튼을 클릭했을때
            vote = new Vote(); //새로 인스턴스생성
            vote.user = user;
            vote.value = value;
            
            //게시물에 속한 투표인지 댓글에 속한 투표인지 확인
            if (comment) vote.comment = comment; // 댓글에 속한 거라면 코멘트로 저장
            else vote.post = post; //아니라면 포스트에 저장

            await vote.save(); //저장하기
        } else if (value === 0) { //이미 누른 버튼을 또 누를때 reset 
            vote.remove();
        } else if (vote.value !== value) { //vote가 있는대 벨류값이 다를때 즉 좋아요를 눌렀는대 싫어요를 새로 눌렸을경우 업데이트하기
            vote.value = value; //이제 버튼을 클릭한 위의 경우가 이미 만들어져 있으므로 업데이트 시키면됨
            await vote.save();
        }

        post = await Post.findOneOrFail({ //포스트에 대한 정보 가져오기
            where: { identifier, slug},
            relations:["comments","comments.votes","sub","votes"] //조인시키기
        })

        post.setUserVote(user);
        post.comments.forEach(c => c.setUserVote(user));

        return res.json(post); //프론트단에 보내주기

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}


const router = Router();

router.post("/", userMiddleware, authMiddleware, vote);

export default router;