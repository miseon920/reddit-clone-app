import { Expose,Exclude } from 'class-transformer';
import { User } from './User';
import { Column, Entity, Index, ManyToMany, ManyToOne, JoinColumn, OneToMany, BeforeInsert } from 'typeorm';
import BaseEntity from './Entity';
import Sub from './Sub';
import Vote from './Vote';
import Comment from './Comment';
import { makeId } from '../utils/helpers';
import { slugify } from "transliteration";

//게시글 하나의 상세페이지로 보면됨

@Entity("posts")

export default class Post extends BaseEntity{
    @Index()
    @Column()
    identifier: string;

    @Column()
    title: string;

    @Index()
    @Column()
    slug: string;

    @Column({nullable: true, type:"text"})
    body:string;

    @Column()
    subName: string;
    
    @Column()
    username:string;
    
    @ManyToOne(() => User, (user) => user.posts)
    @JoinColumn({ name: "username", referencedColumnName: "username" })
    user: User;

    @ManyToOne(() => Sub, (sub) => sub.posts)
    @JoinColumn({ name: "subName", referencedColumnName: "name"})
    sub: Sub;

    @Exclude() //리턴값에서 제외시킴
    @OneToMany(()=>Comment, (comment) => comment.post)
    comments:Comment[];

    @Exclude()
    @OneToMany(()=> Vote, (vote)=> vote.post)
    votes:Vote[];

    @Expose() get url(): string{
       return `/r/${this.subName}/${this.identifier}/${this.slug}`
    }
    
    @Expose() get commentCount(): number{
        return this.comments?.length;
    }

    @Expose() get voteScore():number{
        return this.votes?.reduce((memo, curt) => memo + (curt.value || 0), 0);
        //reduce는 누적계산 현재 벨류 + 커런트벨류가 반복됨
    }

    protected userVote: number;

    setUserVote(user:User){
        const index = this.votes?.findIndex(v => v.username === user.username);
        this.userVote = index > -1 ? this.votes[index].value : 0;
    }
    
    @BeforeInsert()
    makeIdAndSlug(){
        this.identifier = makeId(7);
        this.slug = slugify(this.title);
    }
}

/**
 * #슬러그(slug)
 * 페이지나 포스트를 설명하는 핵심단어의 집합
 * 보통 페이지의 포스트 제목에서 조사,전치사,쉼표,마침표등을 빼고 띄어쓰기는 하이픈(-)으로대체해서 url에 사용(실제로는 언더바(_)사용)
 * 검색엔진에서 더 빨리 페이지를 찾아주고 정확도를 높여줌
 */