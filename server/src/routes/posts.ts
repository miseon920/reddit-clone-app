import { Request, Response, Router } from "express";
import userMiddleware from "../middlewares/user";
import authMiddleware from "../middlewares/auth";
import Sub from "../entities/Sub";
import Post from "../entities/Post";
import Comment from "../entities/Comment";

const getPosts = async (req: Request, res: Response) => { 
    const currentPage: number = (req.query.page || 0) as number;
    const perPage: number = (req.query.conunt || 8) as number; //여기서는 number로 취급
    // as 키워드는 '컴파일' 단계에서 타입 검사를 할 때 타입스크립트가 감지하지 못하는 애매한 타입 요소들을 직접 명시해주는 키워드
    /**as 키워드는 Type Assertion(타입 단언)으로, 컴파일 단계에서 타입스크립트가 잘못 혹은 보수적으로 타입을 추론하는 경우 개발자가 수동으로 컴파일러에게 특정 변수에 대한 타입 힌트를 주는 것이다.
        is 키워드는 Type Guard(타입 가드)로, as가 특정 변수 하나에 국한된 것이라면 
        is 키워드는 한정된 범위 내의 모든 변수에 대해서 일괄적으로 적용할 수 있는 키워드이다.
     */
    try {
        const posts = await Post.find({
            order: { createdAt: "DESC" },
            relations: ["sub", "votes", "comments"],
            skip: currentPage * perPage, //예를들어 8개를 가져왔따면 8개 스킵후 가져옴
            take:perPage //몇개를 가져올것인가
        })
        if (res.locals.user) { 
            posts.forEach(p => p.setUserVote(res.locals.user));
        }
        return res.json(posts);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다." });
    }
}

const getPost =async (req:Request,res:Response) => {
    const { identifier, slug } = req.params;
    try {
        const post = await Post.findOneOrFail({ //일부 id 또는 찾기 옵션과 일치하는 첫 번째 엔터티를 찾습니다 . 일치하는 것이 없으면 반환된 약속을 거부합니다.
            where: { identifier, slug },
            relations: ["sub", "votes"]
            //relations []안의 것들을 join 하는 것/ id를 통해서 접근했을때 전부 접근가능
            //Post에 관련된 커뮤니티(sub)와 투표(votes)를 가져올 수 있다
        });
        if (res.locals.user) { 
             post.setUserVote(res.locals.user); //Post entities 안에 setUserVote를 불러온것
        }

        return res.send(post);
    } catch (error) {
        console.log(error);
        return res.status(404).json({error:"게시물을 찾을 수 없습니다."})
    }
}
const createPost = async(req: Request, res: Response) => { 
    const { title, body, sub } = req.body; //프론트단에서 넘겨준 값

    if (title.trim() === "") {
        return res.status(400).json({ title: "제목은 비워둘 수 없습니다." });
    }
    const user = res.locals.user;

    try { //데이터베이스 작업
        const subRecord = await Sub.findOneByOrFail({ name: sub}); //커뮤니티의 이름과 같은 것을 데이터베이스에서 찾아서 넣어준것/findOneByOrFail - 주어진 것과 일치하는 첫번째 엔티티를 찾습니다. 일치하는것이 없다면 반환을 거부함
        const post = new Post(); //저장하기
        post.title = title;
        post.body = body; //프론트에서 받아온 body
        post.user = user;
        post.sub = subRecord; //

        await post.save();

        return res.json(post);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "문제가 발생했습니다.?" });
    }
}
//댓글 가져오기
const getPostComments = async(req:Request,res:Response) => { 
    const { identifier, slug } = req.params;
    try {
        const post = await Post.findOneByOrFail({ identifier, slug });
        const comments = await Comment.find({
           where: { postId: post.id },
           order: { createdAt: "DESC" },
           relations:["votes"]
        })

        if (res.locals.user) { 
            comments.forEach((c) => c.setUserVote(res.locals.user));
        }
        return res.json(comments);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "댓글 가져오기 문제가 발생했습니다." });
    }
}

//댓글 작성부분
const createPostComment = async(req:Request,res:Response) => { 
    const { identifier, slug } = req.params;
    const body = req.body.body; //프론트에서 req로 보낼때 body로 보냈기 때문에 body가 됨(맨끝에 바디)
    try {
        const post = await Post.findOneByOrFail({ identifier, slug }); //db에서 같은것 찾기
        const comment = new Comment();
        comment.body = body;
        comment.user = res.locals.user; //미들웨어에서 받아온 값
        comment.post = post;

        if (res.locals.user) { 
            post.setUserVote(res.locals.user);
        }
        await comment.save();
        return res.json(comment);
    } catch (error) {
        console.log(error);
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
        
    }
}




const router = Router();
router.get("/:identifier/:slug", userMiddleware, getPost);
router.post("/", userMiddleware, authMiddleware, createPost);

router.get("/", userMiddleware, getPosts);

router.post("/:identifier/:slug/comments", userMiddleware, createPostComment);
router.get("/:identifier/:slug/comments", userMiddleware, getPostComments); //댓글 가져오기

export default router;

/**
 * 보낼땐 post, 가져올땐 get
 * 
 */