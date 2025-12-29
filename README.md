# AI 목업 이미지 생성기 🎨

AI 기반 제품 목업 이미지 생성 웹 애플리케이션입니다. 디자이너가 제품 기획 초기 단계에서 실제 제품과 유사한 시각적 목업을 빠르게 생성할 수 있습니다.

## 주요 기능

- 🔄 **IP 교체 모드**: 기존 제품 이미지에서 캐릭터만 교체
- ✏️ **스케치 → 목업**: 2D 디자인 스케치를 실사 목업으로 변환
- 🖼️ **배경 합성**: 캐릭터를 제품에 자연스럽게 합성
- 📚 **히스토리 기반**: 이전 결과 기반으로 재생성
- 🎨 **인페인팅**: 생성된 이미지의 특정 부분만 수정

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript (strict mode)
- **스타일링**: Tailwind CSS v4 + shadcn/ui
- **상태 관리**: Zustand
- **데이터베이스**: PostgreSQL (Docker)
- **ORM**: Prisma
- **인증**: JWT (Access Token + Refresh Token)
- **AI 모델**: Google gemini-2.5-flash-image
- **유효성 검사**: Zod

## 시작하기

### 1. 사전 요구사항

- Node.js 18+ 
- Docker Desktop
- Google Gemini API 키

### 2. 프로젝트 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일에서 GOOGLE_GEMINI_API_KEY 설정
```

### 3. Docker 실행 (PostgreSQL + Redis)

```bash
# Docker Desktop을 먼저 실행한 후
docker-compose -f docker/docker-compose.yml up -d
```

### 4. 데이터베이스 마이그레이션

```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# Prisma Client 생성
npx prisma generate
```

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (auth)/            # 인증 페이지 (로그인, 회원가입)
│   ├── (protected)/       # 인증 필수 페이지
│   └── api/               # API 라우트
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── generation/       # 이미지 생성 컴포넌트
│   └── project/          # 프로젝트 관련 컴포넌트
├── lib/                   # 유틸리티 및 추상화 레이어
│   ├── ai/               # AI 프로바이더 (Gemini)
│   ├── auth/             # 인증 유틸리티
│   ├── db/               # 데이터베이스 및 레포지토리
│   ├── storage/          # 파일 스토리지
│   └── utils/            # 유틸리티 함수
├── stores/               # Zustand 스토어
└── types/                # TypeScript 타입 정의
```

## 추상화 레이어

이 프로젝트는 향후 프로덕션 환경에서 쉽게 교체할 수 있도록 추상화 레이어로 구현되어 있습니다:

### 데이터베이스 (IRepository)
```typescript
// 현재: PostgreSQL + Prisma
// 향후: Supabase, PlanetScale, MongoDB 등으로 교체 가능
```

### 파일 스토리지 (IStorageProvider)
```typescript
// 현재: 로컬 파일 시스템
// 향후: AWS S3, Supabase Storage, GCS 등으로 교체 가능
```

### AI 모델 (IAIModelProvider)
```typescript
// 현재: Google Gemini
// 향후: DALL-E, Stable Diffusion, Midjourney 등으로 교체 가능
```

## 환경 변수

```env
# 데이터베이스
DATABASE_URL="postgresql://mockup_user:mockup_password@localhost:5432/mockup_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# 스토리지
STORAGE_PROVIDER="local"
LOCAL_UPLOAD_PATH="./uploads"

# AI
GOOGLE_GEMINI_API_KEY="your-api-key"
NEXT_PUBLIC_DEFAULT_AI_MODEL="gemini-2.5-flash-image"
```

## API 엔드포인트

### 인증
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `POST /api/auth/refresh` - 토큰 갱신
- `GET /api/auth/me` - 현재 사용자 정보

### 프로젝트
- `GET /api/projects` - 프로젝트 목록
- `POST /api/projects` - 프로젝트 생성
- `GET /api/projects/:id` - 프로젝트 조회
- `PUT /api/projects/:id` - 프로젝트 수정
- `DELETE /api/projects/:id` - 프로젝트 삭제

### 이미지 생성
- `POST /api/generate` - 이미지 생성 (4장)
- `POST /api/inpaint` - 인페인팅 (부분 편집)
- `POST /api/upscale` - 고해상도 변환

## 라이선스

MIT License

## 문의

질문이 있으시면 이슈를 생성해 주세요!
