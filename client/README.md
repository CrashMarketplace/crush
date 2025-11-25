# BILIDA Market - 중고 거래 플랫폼

Railway와 Vercel로 배포된 중고 거래 마켓 플레이스입니다.

## 주요 기능

### 상품 관리
- ✅ 상품 등록 (이미지 업로드 지원)
- ✅ 상품 수정 (본인이 등록한 상품만)
- ✅ 상품 삭제 (본인이 등록한 상품만)
- ✅ 상품 상태 관리 (판매중 → 예약중 → 판매완료)
- ✅ 상품 검색 및 카테고리별 조회
- ✅ 좋아요 기능

### 예약 시스템
- ✅ 상품 예약 생성 (만날 장소, 시간, 메모 입력)
- ✅ 예약 상태 관리 (대기중 → 확정 → 완료/취소)
- ✅ 내 예약 목록 조회
- ✅ 예약 시 상품 상태 자동 변경

### 채팅 기능
- ✅ 실시간 채팅 (Socket.io)
- ✅ 상품별 채팅방 생성
- ✅ 채팅 목록 조회

### 관리자 페이지
- ✅ 모든 상품 조회 및 삭제
- ✅ 사용자 관리 (강퇴/해제)
- ✅ 채팅 기록 조회 및 삭제
- ✅ 예약 내역 조회 및 삭제

### 사용자 인증
- ✅ 회원가입 / 로그인
- ✅ 이메일 인증
- ✅ 프로필 관리

## 기술 스택

### Frontend
- React 19 + TypeScript
- React Router v7
- Tailwind CSS
- Socket.io Client
- Vite

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT 인증
- AWS S3 (이미지 업로드)

## 배포
- Frontend: Vercel
- Backend: Railway
- Database: MongoDB Atlas

## 개발 환경 설정

```bash
# 클라이언트
cd client
npm install
npm run dev

# 서버
cd server
npm install
npm run dev
```

## 환경 변수

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:4000
```

### Server (.env)
```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret
PUBLIC_BASE_URL=http://localhost:4000
PORT=4000
```

## 새로 추가된 기능

### 1. 상품 수정
- 경로: `/product/edit/:id`
- 본인이 등록한 상품만 수정 가능
- 제목, 설명, 가격, 카테고리, 이미지 등 모든 정보 수정 가능

### 2. 예약 시스템
- 경로: `/reservations`
- 상품 상세 페이지에서 "예약하기" 버튼으로 예약 생성
- 만날 장소, 시간, 메모 입력 가능
- 예약 상태: 대기중 → 확정 → 완료/취소
- 예약 시 상품 상태가 자동으로 "예약중"으로 변경

### 3. 관리자 페이지
- 경로: `/admin`
- 관리자 권한이 있는 사용자만 접근 가능
- 4개 탭: 상품 관리, 사용자 관리, 채팅 관리, 예약 관리
- 모든 데이터 조회 및 삭제 가능
- 사용자 강퇴/해제 기능

## API 엔드포인트

### 상품
- `PATCH /api/products/:id` - 상품 수정
- `PATCH /api/products/:id/status` - 상품 상태 변경

### 예약
- `POST /api/reservations` - 예약 생성
- `GET /api/reservations/my` - 내 예약 목록
- `PATCH /api/reservations/:id/status` - 예약 상태 변경

### 관리자
- `GET /api/admin/products` - 모든 상품 조회
- `DELETE /api/admin/products/:id` - 상품 삭제
- `GET /api/admin/users` - 모든 사용자 조회
- `PATCH /api/admin/users/:id/ban` - 사용자 강퇴/해제
- `GET /api/admin/chats` - 모든 채팅 조회
- `DELETE /api/admin/chats/:id` - 채팅 삭제
- `GET /api/admin/reservations` - 모든 예약 조회
- `DELETE /api/admin/reservations/:id` - 예약 삭제
