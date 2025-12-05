# Railway 배포 설정 가이드

## 🚨 VAPID 키 오류 해결

현재 Railway에서 VAPID 키 오류가 발생하고 있습니다. 다음 방법으로 해결할 수 있습니다.

### 방법 1: VAPID 키 삭제 (권장)

푸시 알림 기능이 필요하지 않다면 환경 변수를 삭제하세요:

1. Railway 대시보드 접속
2. 프로젝트 선택
3. Variables 탭 이동
4. 다음 변수 삭제:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
5. 서비스 재배포

### 방법 2: 올바른 VAPID 키 생성 및 설정

푸시 알림 기능을 사용하려면:

1. **로컬에서 VAPID 키 생성**
   ```bash
   cd server
   npm run generate-vapid
   ```

2. **생성된 키 복사**
   - Public Key와 Private Key가 출력됩니다
   - 두 키를 모두 복사하세요

3. **Railway 환경 변수 설정**
   - Railway 대시보드 → Variables 탭
   - `VAPID_PUBLIC_KEY`: 생성된 공개 키 입력
   - `VAPID_PRIVATE_KEY`: 생성된 비밀 키 입력

4. **서비스 재배포**

## 필수 환경 변수

Railway에 다음 환경 변수가 설정되어 있어야 합니다:

```env
# 필수
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key_here
PUBLIC_BASE_URL=https://your-app.up.railway.app

# 선택 (푸시 알림 사용 시)
VAPID_PUBLIC_KEY=생성된_공개키
VAPID_PRIVATE_KEY=생성된_비밀키

# 선택 (이메일 발송 시)
RESEND_API_KEY=your_resend_api_key

# 선택 (AWS S3 사용 시)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=your_bucket_name
```

## 배포 확인

배포 후 다음을 확인하세요:

1. **서버 로그 확인**
   - Railway 대시보드 → Deployments → 최신 배포 클릭
   - 로그에서 다음 메시지 확인:
     - ✅ MongoDB connected
     - ✅ Server started successfully
     - ⚠️ VAPID 키 관련 경고 (있다면)

2. **Health Check**
   ```bash
   curl https://your-app.up.railway.app/health
   ```
   응답: `{"ok":true,"uptime":...}`

3. **API 테스트**
   ```bash
   curl https://your-app.up.railway.app/api/products
   ```

## 문제 해결

### 서버가 시작되지 않는 경우

1. **로그 확인**
   - Railway 대시보드에서 에러 로그 확인

2. **환경 변수 확인**
   - MONGO_URI가 올바른지 확인
   - JWT_SECRET이 설정되어 있는지 확인

3. **빌드 확인**
   - `npm run build` 명령이 성공했는지 확인

### VAPID 키 오류가 계속 발생하는 경우

1. **환경 변수 완전 삭제**
   - Railway에서 VAPID 관련 변수 모두 삭제
   - 서비스 재배포

2. **새 키 생성**
   - 로컬에서 `npm run generate-vapid` 실행
   - 새로 생성된 키를 Railway에 추가

3. **캐시 클리어**
   - Railway에서 "Clear Cache and Redeploy" 실행

## 푸시 알림 없이 사용하기

푸시 알림 기능은 선택사항입니다. VAPID 키 없이도 다음 기능들은 정상 작동합니다:

- ✅ 상품 등록/수정/삭제
- ✅ 예약 시스템
- ✅ 결제 시스템
- ✅ 리뷰 시스템
- ✅ 채팅 기능
- ✅ 관리자 페이지
- ✅ 알림 페이지 (웹 푸시만 비활성화)

## 배포 체크리스트

- [ ] MongoDB Atlas 연결 확인
- [ ] JWT_SECRET 설정
- [ ] PUBLIC_BASE_URL 설정
- [ ] VAPID 키 설정 또는 삭제
- [ ] 빌드 성공 확인
- [ ] Health Check 통과
- [ ] API 응답 확인
- [ ] 프론트엔드 연결 확인

## 추가 설정

### Custom Domain 설정

1. Railway 대시보드 → Settings → Domains
2. Custom Domain 추가
3. DNS 레코드 설정 (CNAME)
4. SSL 인증서 자동 발급 대기

### 자동 배포 설정

1. GitHub 저장소 연결
2. main 브랜치 푸시 시 자동 배포
3. PR 생성 시 Preview 환경 자동 생성

## 모니터링

### 로그 확인
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 실시간 로그 확인
railway logs
```

### 메트릭 확인
- Railway 대시보드 → Metrics
- CPU, 메모리, 네트워크 사용량 확인

## 문의

배포 관련 문제가 있으면 Railway 로그를 확인하거나 관리자에게 문의하세요.
