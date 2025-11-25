# 푸시 알림 설정 가이드

## 개요

BILIDA 마켓은 웹 푸시 알림을 지원합니다. 사용자는 브라우저와 모바일에서 실시간 알림을 받을 수 있습니다.

## 알림 종류

1. **새로운 예약** - 판매자에게 전송
2. **예약 확정** - 구매자에게 전송
3. **예약 취소** - 상대방에게 전송
4. **거래 완료** - 구매자에게 전송

## 서버 설정

### 1. VAPID 키 생성

```bash
cd server
npm run generate-vapid
```

### 2. 환경 변수 설정

생성된 키를 `.env` 파일에 추가:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### 3. 서버 재시작

```bash
npm run dev
```

## 클라이언트 설정

### 자동 설정

- 사용자가 로그인하면 자동으로 알림 권한 요청
- 권한 승인 시 자동으로 푸시 알림 구독
- 서비스 워커 자동 등록

### 수동 테스트

브라우저 콘솔에서:

```javascript
// 알림 권한 요청
Notification.requestPermission().then(permission => {
  console.log('알림 권한:', permission);
});

// 테스트 알림
new Notification('테스트', {
  body: '푸시 알림이 작동합니다!',
  icon: '/vite.svg'
});
```

## 브라우저 지원

### 데스크톱
- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Opera 37+
- ❌ Safari (macOS 13+ 일부 지원)

### 모바일
- ✅ Chrome Android
- ✅ Firefox Android
- ✅ Samsung Internet
- ❌ iOS Safari (PWA로 설치 시 일부 지원)

## 사용자 가이드

### 알림 활성화

1. 로그인 후 브라우저에서 알림 권한 요청 팝업 표시
2. "허용" 클릭
3. 자동으로 푸시 알림 구독 완료

### 알림 비활성화

**브라우저 설정에서:**
1. 브라우저 설정 → 개인정보 및 보안
2. 사이트 설정 → 알림
3. BILIDA 사이트 찾아서 차단

**또는 주소창에서:**
1. 주소창 왼쪽 자물쇠 아이콘 클릭
2. 알림 → 차단

## 문제 해결

### 알림이 오지 않는 경우

1. **브라우저 알림 권한 확인**
   - 주소창 자물쇠 아이콘 → 알림 → 허용

2. **서비스 워커 확인**
   - 개발자 도구 → Application → Service Workers
   - 서비스 워커가 활성화되어 있는지 확인

3. **구독 상태 확인**
   - 콘솔에서 "푸시 구독 성공" 메시지 확인
   - 없으면 페이지 새로고침

4. **VAPID 키 확인**
   - 서버 로그에서 VAPID 키 설정 확인
   - 환경 변수가 올바르게 설정되었는지 확인

### 개발 환경에서 테스트

```bash
# 서버
cd server
npm run dev

# 클라이언트 (다른 터미널)
cd client
npm run dev
```

- HTTPS 또는 localhost에서만 작동
- 프로덕션 배포 시 HTTPS 필수

## 프로덕션 배포

### Vercel (클라이언트)
1. `client/public/sw.js` 파일이 포함되어 있는지 확인
2. 빌드 후 자동으로 배포됨

### Railway (서버)
1. 환경 변수에 VAPID 키 추가
2. `web-push` 패키지가 `package.json`에 포함되어 있는지 확인
3. 배포 후 자동으로 적용

## 보안

- VAPID 키는 절대 공개하지 마세요
- 프라이빗 키는 서버에만 저장
- 퍼블릭 키는 클라이언트에 노출되어도 안전
- HTTPS 환경에서만 작동

## 참고 자료

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
