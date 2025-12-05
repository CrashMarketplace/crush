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

### 💳 결제 시스템 (NEW!)
- ✅ 에스크로 안전 결제
- ✅ 결제 수단: 에스크로, 카드, 계좌이체
- ✅ 거래 완료 시 판매자에게 자동 지급
- ✅ 환불 시스템
- ✅ 결제 내역 조회

### ⭐ 사용자 평가 시스템 (NEW!)
- ✅ 매너 온도 (0-100°C)
- ✅ 신뢰 지수 (0-100점)
- ✅ 거래 후 리뷰 작성
- ✅ 세부 평가: 시간약속, 친절도, 의사소통, 상품상태
- ✅ 리뷰 태그 시스템
- ✅ 사용자별 리뷰 목록 조회

### 채팅 기능
- ✅ 실시간 채팅 (Socket.io)
- ✅ 상품별 채팅방 생성
- ✅ 채팅 목록 조회

### 🔔 알림 시스템
- ✅ 웹 푸시 알림 (선택사항)
- ✅ 알림 페이지
- ✅ 읽지 않은 알림 배지

### 🤖 AI 사기 위험 분석 (NEW!)
- ✅ 다차원 위험도 분석 (계정나이, 거래이력, 가격, 리뷰, 행동패턴)
- ✅ 실시간 위험도 점수 (0-100점)
- ✅ 위험 레벨 분류 (낮음/보통/높음)
- ✅ 구체적인 위험 요소 표시
- ✅ 맞춤형 거래 권장사항
- ✅ 관리자 대시보드 (전체 상품 위험도 분석)

### 🗺️ 카카오 지도 연동 (NEW!)
- ✅ 주소 검색 및 자동완성
- ✅ 지도에서 위치 선택
- ✅ 상품 등록 시 거래 희망 장소 지정
- ✅ 예약 시 만날 장소 지도로 선택
- ✅ 상품 상세 페이지에서 위치 표시
- ✅ 좌표 기반 정확한 위치 저장

### 관리자 페이지
- ✅ 모든 상품 조회 및 삭제
- ✅ 사용자 관리 (강퇴/해제)
- ✅ 채팅 기록 조회 및 삭제
- ✅ 예약 내역 조회 및 삭제

### 사용자 인증
- ✅ 회원가입 / 로그인
- ✅ 이메일 인증
- ✅ 프로필 관리

### 📄 법적 페이지
- ✅ 회사 소개
- ✅ 이용약관
- ✅ 개인정보처리방침

### 🔍 SEO 최적화
- ✅ 메타 태그 설정
- ✅ Open Graph 태그
- ✅ 구조화된 데이터 (JSON-LD)
- ✅ 사이트맵
- ✅ robots.txt

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

# 선택사항 (푸시 알림 사용 시)
VAPID_PUBLIC_KEY=생성된_공개키
VAPID_PRIVATE_KEY=생성된_비밀키
```

## 🚨 Railway 배포 오류 해결

**VAPID 키 오류가 발생하는 경우:**

Railway 대시보드 → Variables 탭에서 다음 변수를 **삭제**하세요:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

푸시 알림 없이도 모든 기능이 정상 작동합니다.

자세한 내용은 [Railway 설정 가이드](../RAILWAY_SETUP.md)를 참고하세요.

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

### 💳 결제
- `POST /api/payments` - 결제 생성 (에스크로)
- `POST /api/payments/:id/complete` - 거래 완료 (판매자 지급)
- `POST /api/payments/:id/refund` - 환불 요청
- `GET /api/payments/my-payments` - 내 결제 내역
- `GET /api/payments/:id` - 특정 결제 조회

### ⭐ 리뷰
- `POST /api/reviews` - 리뷰 작성
- `GET /api/reviews/user/:userId` - 사용자가 받은 리뷰
- `GET /api/reviews/reservation/:reservationId` - 예약의 리뷰

### 🤖 AI 사기 위험 분석
- `GET /api/fraud-detection/analyze/:productId?sellerId={sellerId}` - 상품 사기 위험 분석

### 관리자
- `GET /api/admin/products` - 모든 상품 조회
- `DELETE /api/admin/products/:id` - 상품 삭제
- `GET /api/admin/users` - 모든 사용자 조회
- `PATCH /api/admin/users/:id/ban` - 사용자 강퇴/해제
- `GET /api/admin/chats` - 모든 채팅 조회
- `DELETE /api/admin/chats/:id` - 채팅 삭제
- `GET /api/admin/reservations` - 모든 예약 조회
- `DELETE /api/admin/reservations/:id` - 예약 삭제

## 📚 추가 문서

- [결제 및 리뷰 시스템 가이드](../PAYMENT_REVIEW_GUIDE.md)
- [관리자 가이드](../ADMIN_GUIDE.md)
- [푸시 알림 설정](../PUSH_NOTIFICATIONS.md)
- [SEO 최적화 가이드](../SEO_GUIDE.md)
- [AI 사기 위험 분석 가이드](../AI_FRAUD_DETECTION_GUIDE.md)
- [카카오 지도 API 설정 가이드](../KAKAO_MAP_SETUP.md)
