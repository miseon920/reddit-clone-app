import { NextFunction,Request,Response } from "express";
import  jwt  from 'jsonwebtoken';
import { User } from '../entities/User';

export default async (req:Request,res:Response,next:NextFunction) => {
    try {
        const token = req.cookies.token;
       // console.log("token",token);
        if(!token) return next(); //토큰이 없을 경우 바로 넘기기

        const {username}: any = jwt.verify(token, process.env.JWT_SECRET);
        //인수로 서명을 확인하기 위한 키 , 일부 알고리즘별 매개변수, 서명 및 원래 서명된 데이터를 사용합니다. Promise서명이 유효한지 여부를 나타내는 boolen 값으로 충족되는 를 반환 합니다.
        //verify(algorithm, key, signature, data)
        const user = await User.findOneBy({username});
        //console.log("user",user);
        //유저정보가 없다면 throw error
        if(!user) throw new Error("Unauthenticated");

        //유저 정보를 res.locals.user에 넣어주기
        res.locals.user = user;
        return next(); //현재 라우터에서 판단하지 않고 다음 라우터로 넘기겠다. 쓰지않을경우 갇히는 펜딩이 일어난다.
    } catch (error) {
        console.log(error);
        return res.status(400).json({error:"에러_something went wrong"})
    }
    
}