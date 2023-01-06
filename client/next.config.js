/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains:["www.gravatar.com","localhost"] //외부 url 이미지를 사용할 수 있게 추가해준다
  },
  compiler: { //서버측 className과 클라이언트측 className을 동일하게 유지되도록 하기 위해
    styledComponents: true
  }
}

module.exports = nextConfig
