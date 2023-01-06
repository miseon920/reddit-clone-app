import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "./entities/User"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres", //.env에 적었던 내용 적어주기
    password: "password",
    database: "postgres",
    synchronize: true, //개발환경에서는 true , 운영환경에서는 false
    logging: false,
    entities: ["src/entities/**/*.ts"],
    migrations: [],
    subscribers: [],
})


//https://hckcksrl.medium.com/typescript%EC%9D%84-%EC%82%AC%EC%9A%A9%ED%95%B4-typeorm-%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0-cb7140b69c6c