import { OneToMany } from 'typeorm';
import { User } from './User';
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import BaseEntity from './Entity';
import { Expose } from 'class-transformer';
import Post from './Post';

//리스트부분 페이지로 보면됨

@Entity("subs")
export default class Sub extends BaseEntity{
    @Index()
    @Column({unique: true})
    name: string;

    @Column()
    title: string;

    @Column({type: 'text', nullable: true}) //nullable - 값을 넣지 않아도될때
    description: string;

    @Column({nullable: true})
    imageUrn: string;

    @Column({nullable: true})
    bannerUrn: string;

    @Column()
    username: string;

    @ManyToOne(()=>User)
    @JoinColumn({name: "username", referencedColumnName: "username"}) //User을 참조함 앞에 네임은 위의 유저네임이며 referencedColumnName은 User의 유저네임임
    user:User;
    /**
     * @JoinColumn() 
        -어떤관계쪽이 외래키(Foreign Key)를 가지고 있는지 나타냄
        -propretyName+referencedColumnNasme이라는 열이 자동으로 생성됨
        -매니투원의 경우에는 선택사항이지만 원투원에서는 필수
        *외래키(Foreign Key) = 참조하는 테이블에서 1개의 키(속성또는 속성의 집합)에 해당,
        참조하는 측의 관계변수는 참조되는 측의 테이블의 키를 가르킴
        참조하는 테이블의 속성의 행 1개의 값은 참조되는 측 테이블의 행 값에 대응됨
        -name: 외래키 속성명 name이 없다면 propretyName+referencedColumnNasme이 디폴트가 됨
        -referencedColumnNasme: 참조 엔티티의 참조 속성명/id가 디폴트임/둘다없을경우 FK필드는 FK속성명 + id가 됨(user_id) /FK필드란 외래키 필드
        <->referencedColumnName의 기본값은 Primary Key라고 한다.
     */

    @OneToMany(() => Post, (post) => post.sub)
    posts: Post[]

    @Expose() //클래스트랜스포머에서 가져옴-클래스로 프론트엔드에 보내서 url을 가져올 수 있음
    get imageUrl(): string{
        return this.imageUrn? `${process.env.APP_URL}/images/${this.imageUrn}`:"https://www.gravatar.com/avatar?d=mp&f=y";
        //이미지 urn이 있을경우 가져오고 없을경우 기본이미지 가져오기
    }

    @Expose() //클래스트랜스포머에서 가져옴-클래스로 프론트엔드에 보내서 url을 가져올 수 있음
    get bannerUrl(): string{
        return this.bannerUrn? `${process.env.APP_URL}/images/${this.bannerUrn}`: undefined;
    }

}
//엔티티를 생성해서 상태와 행위를 프론트엔드에서 사용할수 있게함
//트랜스포머에서 expose라는 메서드 사용가능(상태와 행위 전달) /exclude : 트랜스폼 과정에서 프로퍼티를 뛰어넘을 수 있음(프론트엔드에서 제외시킴/리턴값에서 제외)

//URL,URN,URI

/**
 * URI = URL+ URN = 자원식별자
 * URL=> 자원의 위치로 자원을 식별 (LOCATOR)
 * URN => 자원의 이름으로 자원을 식별 (NAME)
 * URL은 어떻게 리소스를 얻을것이고 어디에서 가져와야 하는지 명시하는것
 * URN은 리소르를 어떻게 접근할것인지 명시하지 않고 [경로와 리소스 자체를 특정하는 것]을 목표로 하는 URI이다.
 */