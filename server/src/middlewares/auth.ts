import { NextFunction,Request,Response } from "express";
import  jwt  from 'jsonwebtoken';
import { User } from '../entities/User';

export default async (req:Request,res:Response,next:NextFunction) => {
    try {
      const user:User | undefined = res.locals.user;
      //res.locals의 프로퍼티들은 request의 라이프 타임 동안에만 유효하다.
      //html/view 클라이언트 사이드로 변수들을 보낼 수 있으며, 그 변수들은 오로지 거기서만 사용할 수 있다.
      if(!user) throw new Error("Unauthenticated");
        // 관리자가 잇을경우에 로직 더 추가하기
      return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({error:"에러_Unauthenticated"});
    }
    
}