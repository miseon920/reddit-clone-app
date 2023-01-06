import { IsEmail,Length } from "class-validator"
import { Entity,Column, Index, OneToMany, BeforeInsert } from "typeorm"
import bcrypt from "bcryptjs";
import Post from './Post';
import Vote from './Vote';
import BaseEntity from './Entity';

/*import {...} from 'class-validator/types/decorator/decorators' 에서 from 절을 다음 변경하면 됩니다. from 'class-validator'*/

@Entity("users") //엔티티이름 users
export class User extends BaseEntity {

    // @PrimaryGeneratedColumn() / 베이스 엔티티에 있으므로 삭제
    // id: number
    
    //이메일에 대한 내용
    @Index()
    @IsEmail(undefined,{message: "이메일 주소가 잘못되었습니다."}) //벨리데이터 작성 - 찾을수 없을경우 메시지 띄우기
    @Length(1, 255, {message: "이메일주소는 비워둘 수 없습니다."}) //1~255길이
    @Column({unique: true})
    email: string

    @Index()
    @Length(3,32,{message: "사용자의 이름은 3자 이상이어야 합니다."})
    @Column({unique:true}) 
    //QueryFailedError: there is no unique constraint matching given keys for referenced table "users" 발생할경우 유니크로 해주어야함
    username: string

    @Column()
    @Length(6,255,{message: "비밀번호는 6자리 이상이어야 합니다."})
    password: string

    //원투매니는 한명이 게시글을 여러개 작성할 수 있음 <-> 게시글에서 유저로 접근할경우 매니투 원
    //파라미터로 type,inverseSide - 유저에서 포스트로 포스트에서 유저로 ,Option
    @OneToMany(()=> Post, (post)=> post.user) //(타임) => 칼럼지정
    posts: Post[] //타입은 게시글이 여러개이므로 배열

    @OneToMany(()=> Vote, (vote)=> vote.user) //투표
    votes: Vote[]

    @BeforeInsert() //저장하기 전에 해시 패시워드 작업을 함 
    async hashPassword(){
        this.password = await bcrypt.hash(this.password,6)
    }
    //암호를 저장하는 보다 안전한 방법은 암호를 원래 암호로 다시 변환할 수 없는 데이터로 변환하는 것입니다. 이 메커니즘을 해싱 이라고 합니다. 
}


/*
    @Entity() 데코레이터 클래스는 User 클래스가 엔티티임을 나타내는 데 사용 / @Entity('user') = CREATE TABLE user
    @Column() 데코레이터 클래스는 User 엔티티의 email 및 username과 같은 다른 열을 나타내는 데 사용 / entity의 속성을 테이블 칼럼으로 표시합니다.
    @index() 데이터 베이스 인덱스를 생성 / 엔티티 속성 및 엔티티에 사용가능
    엔티티에 사용될경우 복합열로 인덱스를 생성할 수 있음 //래딧에서는 이메일과 유저네임에 인덱스를 부여함

    #데이터 베이스 인덱스 사용이유
    -책에서 목차를 이용해서 특정주제를 빨리 찾을 수 있듯이 인덱스도 목록의 역할을 함
    -테이블쿼리속도를 올려줌 / 위의 속성때문에 빠르게 찾을 수 있음
    - 모든데이터를 조회하지 않고 데이터 파일 중간에서 검색위치를 빠르게 잡을 수 있음
    - 데이터 양이 많고 변경보다 검색이 빈번한 경우 인덱싱을 하면 좋음

    https://yangeok.github.io/orm/2020/12/14/typeorm-decorators.html
*/