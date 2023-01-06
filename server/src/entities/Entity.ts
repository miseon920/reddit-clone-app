import { instanceToPlain } from 'class-transformer';
import { BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
//기본 엔티티 생성
//id,createdAt,updatedAt은 공통적으로 가지고 있기에 BaseEntity로 따로 생성하고 다른 엔티티에서 상속받아 사용한다
export default abstract class Entity extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    //프로퍼티 : 타입

    //Expose 된 이미지의 이미지 url을 가져오기 위해서/ 해당작업을 해주면 프론트에서 볼 수 있음!
    toJSON() { 
        return instanceToPlain(this);
    }
}
//@PrimaryGeneratedColumn 데코레이터 클래스는 id열이 Board 엔티티의 기본 키 열임을 나타내는 대 사용됩니다.