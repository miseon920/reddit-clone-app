module.exports = {
    apps: [{
        name: "reddit-client",
        script:"npm run start:prod" //pm2 모듈을 빌려서 실행하면 서버가 다운되거나 오류가 있던것을 줄일 수 있음
    }]
}