# 결제 시스템 및 사용자 평가 가이드

## 📋 개요

현장 결제 방식의 안전한 거래 시스템과 사용자 신뢰도를 높이는 평가 시스템이 구현되었습니다.

## 💰 결제 시스템 (현장 결제)

### 주요 기능

1. **현장 결제 방식**
   - 판매자와 직접 만나서 상품 확인 후 결제
   - 현금 또는 계좌이체로 결제
   - 플랫폼 수수료 20% 포함

2. **플랫폼 수수료**
   - 상품 금액의 20%
   - 안전한 거래 환경 제공 및 플랫폼 운영에 사용
   - 구매자가 총 금액(상품 금액 + 수수료) 지불
   - 판매자는 상품 금액만 수령 (수수료 제외)

3. **거래 상태**
   - `pending`: 현장 결제 대기
   - `completed`: 거래 완료
   - `cancelled`: 취소됨

### 결제 프로세스

```
1. 예약 확정 → 2. 거래 확정 (수수료 안내) → 3. 현장 만남 → 4. 상품 확인 → 5. 현장 결제 → 6. 거래 완료
```

### 결제 금액 계산

```
상품 금액: 50,000원
플랫폼 수수료 (20%): 10,000원
총 결제 금액: 60,000원

구매자 지불: 60,000원
판매자 수령: 50,000원
플랫폼 수수료: 10,000원
```

### API 엔드포인트

#### 거래 확정
```http
POST /api/payments
Content-Type: application/json

{
  "reservationId": "예약 ID",
  "productAmount": 50000,
  "platformFee": 10000,
  "amount": 60000,
  "paymentMethod": "in_person"
}
```

#### 거래 완료 (현장 결제 완료)
```http
POST /api/payments/:paymentId/complete
```

#### 거래 취소
```http
POST /api/payments/:paymentId/refund
Content-Type: application/json

{
  "reason": "취소 사유"
}
```

#### 결제 내역 조회
```http
GET /api/payments/my-payments
```

#### 특정 결제 조회
```http
GET /api/payments/:paymentId
```

## ⭐ 사용자 평가 시스템

### 평가 지표

1. **매너 온도** (0-100°C)
   - 기본값: 36.5°C
   - 별점에 따라 증감
   - 5점: +1.0, 4점: +0.5, 3점: 0, 2점: -0.5, 1점: -1.0

2. **신뢰 지수** (0-100점)
   - 긍정 리뷰 비율 기반
   - 높을수록 신뢰도가 높음

3. **거래 통계**
   - 총 리뷰 수
   - 긍정 리뷰 수
   - 부정 리뷰 수
   - 완료된 거래 수

### 리뷰 작성

거래 완료 후 구매자와 판매자 모두 리뷰를 작성할 수 있습니다.

#### 평가 항목
- **전체 평가**: 1-5 별점
- **시간 약속**: 1-5점
- **친절도**: 1-5점
- **의사소통**: 1-5점
- **상품 상태**: 1-5점 (구매자만)

#### 리뷰 태그
- 친절해요
- 시간약속을 잘 지켜요
- 응답이 빨라요
- 매너가 좋아요
- 상품상태가 좋아요
- 설명이 자세해요

### API 엔드포인트

#### 리뷰 작성
```http
POST /api/reviews
Content-Type: application/json

{
  "reservationId": "예약 ID",
  "rating": 5,
  "reviewType": "positive",
  "comment": "좋은 거래였습니다!",
  "tags": ["친절해요", "시간약속을 잘 지켜요"],
  "punctuality": 5,
  "kindness": 5,
  "communication": 5,
  "productCondition": 5
}
```

#### 사용자가 받은 리뷰 조회
```http
GET /api/reviews/user/:userId
```

#### 특정 예약의 리뷰 조회
```http
GET /api/reviews/reservation/:reservationId
```

## 🎨 UI 컴포넌트

### 1. UserRating 컴포넌트
사용자의 매너 온도와 신뢰 지수를 표시합니다.

```tsx
import UserRating from "../components/UserRating";

<UserRating userId={userId} showDetails={true} />
```

### 2. PaymentModal 컴포넌트
결제 모달을 표시합니다.

```tsx
import PaymentModal from "../components/PaymentModal";

<PaymentModal
  reservationId={reservationId}
  productName="상품명"
  amount={50000}
  sellerName="판매자명"
  onClose={() => setShowModal(false)}
  onSuccess={() => loadData()}
/>
```

### 3. ReviewModal 컴포넌트
리뷰 작성 모달을 표시합니다.

```tsx
import ReviewModal from "../components/ReviewModal";

<ReviewModal
  reservationId={reservationId}
  revieweeName="상대방 이름"
  onClose={() => setShowModal(false)}
  onSubmit={() => loadData()}
/>
```

## 📱 페이지

### 1. 결제 내역 페이지 (`/payments`)
- 내 결제 내역 조회
- 거래 완료 처리
- 환불 요청

### 2. 사용자 리뷰 페이지 (`/user/:userId/reviews`)
- 특정 사용자가 받은 리뷰 목록
- 매너 온도 및 신뢰 지수 표시
- 세부 평가 항목 표시

### 3. 예약 페이지 업데이트 (`/reservations`)
- 결제하기 버튼 추가
- 리뷰 작성 버튼 추가
- 결제 상태 표시

## 🔄 거래 워크플로우

### 전체 프로세스

```
1. 상품 등록
   ↓
2. 예약 요청 (구매자)
   ↓
3. 예약 확정 (판매자)
   ↓
4. 거래 확정 (구매자) → 수수료 안내
   ↓
5. 현장 만남 → 상품 확인
   ↓
6. 현장 결제 (총 금액 = 상품 금액 + 수수료 20%)
   ↓
7. 거래 완료 (구매자 확인)
   ↓
8. 리뷰 작성 (구매자 & 판매자)
   ↓
9. 평가 점수 업데이트
```

## 🛡️ 안전 거래 기능

1. **플랫폼 수수료**
   - 안전한 거래 환경 제공
   - 분쟁 조정 및 고객 지원
   - 플랫폼 운영 및 개선

2. **거래 취소**
   - 현장 결제 전까지 취소 가능
   - 취소 사유 기록
   - 상대방에게 알림 전송

3. **리뷰 시스템**
   - 거래 완료 후에만 리뷰 작성 가능
   - 한 거래당 한 번만 리뷰 작성 가능
   - 거래 당사자만 리뷰 작성 가능
   - 신뢰도 평가에 반영

## 📊 데이터 모델

### Payment 모델
```typescript
{
  reservation: ObjectId,      // 예약 ID
  buyer: ObjectId,            // 구매자 ID
  seller: ObjectId,           // 판매자 ID
  amount: Number,             // 결제 금액
  status: String,             // 결제 상태
  paymentMethod: String,      // 결제 수단
  escrowHeldAt: Date,         // 에스크로 보관 시작
  escrowReleasedAt: Date,     // 판매자 지급 시간
  refundedAt: Date,           // 환불 시간
  refundAmount: Number,       // 환불 금액
  refundReason: String        // 환불 사유
}
```

### Review 모델
```typescript
{
  reservation: ObjectId,      // 예약 ID
  reviewer: ObjectId,         // 리뷰 작성자 ID
  reviewee: ObjectId,         // 리뷰 대상자 ID
  rating: Number,             // 1-5 별점
  reviewType: String,         // positive/neutral/negative
  comment: String,            // 코멘트
  tags: [String],            // 태그 목록
  punctuality: Number,        // 시간 약속 (1-5)
  kindness: Number,           // 친절도 (1-5)
  communication: Number,      // 의사소통 (1-5)
  productCondition: Number    // 상품 상태 (1-5)
}
```

### User 모델 (추가 필드)
```typescript
{
  mannerTemperature: Number,     // 매너 온도 (0-100)
  trustScore: Number,            // 신뢰 지수 (0-100)
  totalReviews: Number,          // 총 리뷰 수
  positiveReviews: Number,       // 긍정 리뷰 수
  negativeReviews: Number,       // 부정 리뷰 수
  completedTransactions: Number  // 완료된 거래 수
}
```

## 🚀 사용 방법

### 구매자 입장

1. 원하는 상품에 예약 요청
2. 판매자가 예약 확정하면 "거래 확정" 버튼 클릭
3. 총 결제 금액 확인 (상품 금액 + 수수료 20%)
4. 판매자와 만나서 상품 확인
5. 현장에서 총 금액 결제 (현금 또는 계좌이체)
6. "현장 결제 완료" 버튼 클릭
7. 판매자에 대한 리뷰 작성

### 판매자 입장

1. 예약 요청 확인 후 "확정" 버튼 클릭
2. 구매자가 거래 확정할 때까지 대기
3. 구매자와 만나서 상품 전달
4. 구매자로부터 총 금액 수령 (상품 금액 + 수수료)
5. 구매자가 거래 완료하면 상품 금액 수령 (수수료 제외)
6. 구매자에 대한 리뷰 작성

## 💡 팁

1. **신뢰도 높이기**
   - 시간 약속을 잘 지키세요
   - 친절하게 응대하세요
   - 상품 설명을 정확하게 작성하세요
   - 빠르게 응답하세요

2. **안전한 거래**
   - 공공장소에서 만나세요
   - 상품을 꼼꼼히 확인하세요
   - 거래 완료 전 문제가 있으면 취소하세요
   - 영수증이나 거래 증빙을 남기세요

3. **좋은 리뷰 받기**
   - 정확한 상품 정보 제공
   - 약속 시간 엄수
   - 친절한 태도
   - 빠른 응답

4. **플랫폼 수수료 관련**
   - 구매자가 총 금액(상품 + 수수료)을 지불합니다
   - 판매자는 상품 금액만 수령합니다
   - 수수료는 플랫폼 운영에 사용됩니다
   - 거래 취소 시 수수료가 발생하지 않습니다

## 🔧 관리자 기능

관리자는 모든 결제 및 리뷰를 조회하고 관리할 수 있습니다.

- 결제 내역 조회
- 환불 처리
- 부적절한 리뷰 삭제
- 사용자 평가 점수 조정

## 📞 문의

결제 또는 리뷰 시스템 관련 문의사항은 관리자에게 문의해주세요.
