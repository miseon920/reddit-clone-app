https://velog.io/@wndtlr1024/nextjstypescript-%EA%B8%B0%EC%B4%88%EC%84%B8%ED%8C%85
https://velog.io/@junghyeonsu/React-create-react-app-Typescript-%EC%B4%88%EA%B8%B0-%EC%84%B8%ED%8C%85-%EC%99%84%EB%B2%BD-%EC%A0%95%EB%A6%AC

#기초세팅
도커 및 노드 설치
도커(Docker)는 리눅스의 응용 프로그램들을 프로세스 격리 기술들을 사용해 컨테이너로 실행하고 관리하는 오픈 소스 프로젝트
도커는 컨테이너 기반의 오픈소스 가상화 플랫폼입니다.
다양한 프로그램, 실행환경을 컨테이너로 추상화하고 동일한 인터페이스를 제공하여 프로그램의 배포 및 관리를 단순하게 해줍니다. 
백엔드 프로그램, 데이터베이스 서버, 메시지 큐등 어떤 프로그램도 컨테이너로 추상화할 수 있고 조립PC, AWS, Azure, Google cloud등 어디에서든 실행할 수 있습니다.

1.next.js 설치하기

https://kyounghwan01.github.io/blog/React/next/basic/#next-js%E1%84%80%E1%85%A1-%E1%84%8C%E1%85%A6%E1%84%80%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%84%82%E1%85%B3%E1%86%AB-%E1%84%8C%E1%85%AE%E1%84%8B%E1%85%AD-%E1%84%80%E1%85%B5%E1%84%82%E1%85%B3%E1%86%BC

PS C:\Users\developer\Desktop\reddit-clone-app> cd client
PS C:\Users\developer\Desktop\reddit-clone-app\client>  npx create-next-app@latest --typescript ./

#특징
-따로 config 파일을 정의 하지 않고이 css 파일을 scss로 바꾸고 yarn add sass --dev 를 해주면 next에서 알아서 설정
- a 태그는 전혀 다른 사이트로 페이지를 이동시켜 다시 돌아오지 않는 경우만 사용하고, 그 이외에는 모두 Link 태그를 사용
-가변적으로 변하는 url에 대해 동적 url을 지원 / pages/[값].tsx 왼쪽 페이지 구조의 값은 router.query.값과 동일
-<Link prefetch href="..."> 형식으로 prefetch 값을 전달해주면 데이터를 먼저 불러온다음에 라우팅을 시작 - 라우터 사용시 사용가능
#프로덕션 레벨이란 배포환경을 말함! 빌드되었을경우!

리액트 컴포넌트의 경우.tsx사용 - next.js 이므로

--typescript을 사용함으로써 옵션으로 타입 스크립트를 사용하겠다는 뜻

js파일의 경우 타입스크립트를쓰므로 .ts로 사용


프론트
npx create-next-app@latest --typescritpt

백엔드
npm i morgan nodemon express --save
npm i typescript ts-node @types/node @types/express @types/morgan --save-dev


2.백엔드의 경우 server 폴더 생성 후 위의 명령어 실행
npx tsc --init 로 tsconfig.json 생성 - 타입스크립트 코드를 자스로 컴파일하는 파일 / tsc 명령어 사용




//확장자가 .js인 파일들을 .tsx로 바꿔주면 기존 javascript 기반 react 프로젝트를 typescript 기반으로 바꿔줄 수 있다.

#######백엔드

2.docker - postgres 실행 / postgresql 데이터 데이터베이스 생성
env - 보이지 않는곳에 아이디와 패스워드 저장


3.데이터베이스와 애플리케이션 연결
1)pg: node.js 에서 postgresql 을 사용하기 위한 모듈
2)typeorm / Object-relational mapping, 객체지향 -관계 매핑 / express와 관계형 데이터베이스를 조합할 때 자주 사용되는 ORM
객체와 관계형 데이터베이스의 데이터를 자동으로 매핑(연결)해준다.
-모델기반으로 데이터 베이스 테이블 체계를 자동으로 생성함
-테이블간의 매핑(일대일,일대 다 및 다 대 다)를 만듬
-간단한 cli 명령을 제공(Command Line으로 컴퓨터를 동작할 수 있는 환경, Command Line은 입력과 출력의 형태로 동작하며 모두 text 형태로 이루어져 있다.)
https://velog.io/@fstone/CLI-%EA%B0%9C%EB%85%90-%EB%B0%8F-%EB%AA%85%EB%A0%B9%EC%96%B4-%EC%A0%95%EB%A6%AC
-간단코딩으로 orm 프레임 워크를 사용하기 쉬움
-다른 모듈과 쉽게 통합됨
https://aonee.tistory.com/77
3)reflect-metadata / 데코레이터는 클래스 선언과 멤버에 어노테이션과 메타-프로그래밍 구문을 추가할 수 있는 방법을 제공합니다.
 데코레이터는 JavaScript에 대한 2단계 제안이며 TypeScript의 실험적 기능으로 이용하므로 이것을 사용할수 있게 해주는것이 reflect-metadata 이다
@expression 형식을 사용합니다. 여기서 expression은 데코레이팅 된 선언에 대한 정보와 함께 런타임에 호출되는 함수여야 합니다.
//https://typescript-kr.github.io/pages/decorators.html

npx typeorm init 작성
◆data-source.ts 안에 정보를 기입 - 데이터 베이스 내용 / https://velog.io/@qhgus

4.도커 실행후 npm run dev
5.엔티티 생성
1)id,createdAt,updatedAt은 공통적으로 가지고 있기에 BaseEntity로 따로 생성하고 다른 엔티티에서 상속받아 사용한다
2)엔티티 생성 후 
npm i bcryptjs class-validator class-transformer --save
npm i @types/bcryptjs --save-dev

bcryptjs = 비밀번호를 암호화하여 데이터 베이스에 저장
class-transformer = 데코레이터를 이용해서 요청에서 오는 오브젝트의 프로퍼리를 검증하는 라이브러리(모듈)

*class-transformer를 이용하면 일반 객체(Plain object / 리터럴 오브젝트)를 클래스의 일부 인스턴스(클래스오브젝트/콘스트럭트오브젝트)로 또는 그반대로 변환할 수 있음
*plainToInstance 메서드를 사용하여 클래스 인스턴스로 변환시킴 / 클래스에서 정의한 곳에서 로직을 작성함
#class-transformer 이점
- 정의한곳에 로직이 있으므로 응집력있는 코드가 됨
-plainToInstance를 이용하면 리터럴객체에서 클래스 인스턴스로 넘김
-instanceToPlain을 이용하면 클래스 인스턴스에서 리터럴 객체로 만들어줌

##########클라이언트

npm 설치시 -D 에서 D =dev development / 즉 개발자가 개발을하기 위한 것
postcss-preset-env / POSTCSS 의 수많은 플러그인중 하나이다.
POST CSS는 우리의 CSS를 조금더 현대적으로 바꿔주는 플러그인이다.
POST CSS자체는 아무일도 하지않으며 다양한 플러그인과 플러그인을 추가할 수 있는 환경을 제공한다.
좀더 풀어 설명하자면 POST CSS 는 JS 플러그인을 사용하여 CSS를 변환시키는 툴 입니다.
css에 문제가 없는지 미리 확인 하여 에러 로그를 준다.

1.tailwindcss 적용(테일윈드 적용하기) / 
1)npm i -D postcss-preset-env  tailwindcss
2)npx tailwindcss init
3)postcss.config.js 생성 - tailwindcss와 같은 위치에 있어야함

2.작성할 파일은 src폴더로 넣어서 따로 관리함 / pages와 styles 등 

*미들웨어는 운영 체제에서 제공하지 않는 일반적인 서비스와 기능을 애플리케이션에 제공하는 소프트웨어입니다. 

#로그인 페이지

상태관리툴인 context를 생성
반복되는것은 useState대신 reducer함수를 사용하여 useReducer를 이용함


유저정보를 담은 StateContext을 생성하고 이를 업데이트하는 부분을 DispatchContext로 구현
위의 것을 다른곳에서 사용하기 위해서 Context Provider로 감싸주면 export하여 다른곳에서 사용할수 있게함

최상위에서 콘텍스트를 정리하여 둔것을 사용하기 위해서 import하여 적고 
필요한곳에서 필요한것만 쓰기 위해 const dispatch = useAuthDispatch(); 등으로 디스패치하여 사용합니다.
위의 정의내린 dispatch 형식에 전달할것을 인자로 넣어 사용합니다.
