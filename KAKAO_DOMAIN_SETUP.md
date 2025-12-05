# 카카오 지도 API - 도메인 등록 가이드

## ✅ API 키 설정 완료

JavaScript 키: `1229e49916d98414f650e733b2c3adf1`

## 🌐 도메인 등록 (필수)

카카오 지도 API를 사용하려면 도메인을 등록해야 합니다.

### 1단계: 카카오 개발자 콘솔 접속

1. https://developers.kakao.com 접속
2. 로그인
3. 내 애플리케이션 → BILIDA (또는 생성한 앱) 선택

### 2단계: 플랫폼 설정

1. **앱 설정** → **플랫폼** 메뉴 클릭
2. **Web 플랫폼 등록** 버튼 클릭
3. 다음 도메인들을 **하나씩** 추가:

```
http://localhost:5173
http://localhost:3000
http://127.0.0.1:5173
https://bilida.site
https://www.bilida.site
```

**Vercel 배포 시 추가:**
```
https://your-project-name.vercel.app
https://your-project-name-git-main-username.vercel.app
```

### 3단계: 저장

각 도메인을 입력하고 **저장** 버튼 클릭

## 🧪 테스트

### 로컬 개발 환경

```bash
cd client
npm run dev
```

브라우저에서 접속:
- http://localhost:5173/map-example

### 확인 사항

1. **지도가 표시되는가?**
   - ✅ 정상: 지도가 보임
   - ❌ 오류: 콘솔에서 에러 확인

2. **주소 검색이 되는가?**
   - 검색창에 "서울시청" 입력
   - 결과가 나타나는지 확인

3. **지도 클릭이 되는가?**
   - 지도를 클릭하면 마커가 이동하는지 확인

## ⚠️ 문제 해결

### "Uncaught Error: 유효하지 않은 앱키"

**원인:** 도메인이 등록되지 않음

**해결:**
1. 카카오 개발자 콘솔에서 도메인 등록 확인
2. 현재 접속 중인 도메인이 등록된 도메인과 일치하는지 확인
3. 브라우저 캐시 삭제 후 새로고침

### "카카오 지도 API를 불러올 수 없습니다"

**원인:** API 키가 잘못됨

**해결:**
1. `client/.env` 파일 확인
2. `client/index.html` 파일 확인
3. API 키가 정확한지 확인

### 지도가 회색으로만 표시됨

**원인:** 컨테이너 크기 문제

**해결:**
- 지도 컨테이너에 명시적인 width/height 설정 확인

## 📊 API 사용량 확인

카카오 개발자 콘솔:
- **통계** 메뉴에서 API 호출 횟수 확인
- 무료 플랜: 일 300,000건

## 🚀 프로덕션 배포

### Vercel 환경 변수 설정

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 추가:
   - Name: `VITE_KAKAO_MAP_API_KEY`
   - Value: `1229e49916d98414f650e733b2c3adf1`
   - Environment: Production, Preview, Development 모두 체크

### 배포 후 도메인 등록

Vercel에서 배포 완료 후:
1. 배포된 URL 확인 (예: `https://bilida-xxx.vercel.app`)
2. 카카오 개발자 콘솔에서 해당 URL 추가

## ✨ 다음 단계

지도 API가 정상 작동하면:

1. **상품 등록 페이지에 적용**
   - `client/src/pages/ProductNew.tsx` 수정
   - LocationPicker 컴포넌트 추가

2. **예약 시스템에 적용**
   - `client/src/pages/ListingDetail.tsx` 수정
   - ReservationModal 사용

3. **상품 상세 페이지에 지도 표시**
   - KakaoMap 컴포넌트로 거래 장소 표시

## 📞 지원

문제가 계속되면:
- 카카오 개발자 포럼: https://devtalk.kakao.com
- 카카오 지도 API 문서: https://apis.map.kakao.com/web/guide/
