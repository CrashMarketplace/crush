# 카카오 지도 API 빠른 시작 가이드

## 5분 안에 설정하기

### 1단계: API 키 발급 (2분)

1. https://developers.kakao.com 접속
2. 로그인 → 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름 입력 (예: BILIDA)
4. 앱 설정 → 일반 → JavaScript 키 복사

### 2단계: 환경 변수 설정 (1분)

**개발 환경:**

`client/.env` 파일 수정:
```env
VITE_KAKAO_MAP_API_KEY=복사한_JavaScript_키
```

**프로덕션 (Vercel):**

Vercel 대시보드 → Settings → Environment Variables:
- Name: `VITE_KAKAO_MAP_API_KEY`
- Value: 복사한_JavaScript_키

### 3단계: HTML 수정 (1분)

`client/index.html` 파일에서:

```html
<!-- 이 부분을 찾아서 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services,clusterer,drawing"></script>

<!-- YOUR_APP_KEY를 실제 키로 교체 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=실제_발급받은_키&libraries=services,clusterer,drawing"></script>
```

### 4단계: 도메인 등록 (1분)

카카오 개발자 콘솔:
1. 앱 설정 → 플랫폼 → Web 플랫폼 등록
2. 사이트 도메인 추가:
   ```
   http://localhost:5173
   https://bilida.site
   ```

### 5단계: 테스트

```bash
cd client
npm run dev
```

브라우저에서 http://localhost:5173/map-example 접속

## 사용 예시

### 기본 지도 표시

```tsx
import KakaoMap from "../components/KakaoMap";

<KakaoMap
  latitude={37.5665}
  longitude={126.978}
  height="400px"
/>
```

### 주소 검색

```tsx
import AddressSearch from "../components/AddressSearch";

<AddressSearch
  onSelect={(address, lat, lng) => {
    console.log(address, lat, lng);
  }}
/>
```

### 위치 선택기 (검색 + 지도)

```tsx
import LocationPicker from "../components/LocationPicker";

<LocationPicker
  value={location}
  onChange={(location, lat, lng) => {
    setLocation(location);
  }}
/>
```

## 문제 해결

### "카카오 지도 API를 불러올 수 없습니다"
→ API 키가 올바른지 확인하세요

### 지도가 표시되지 않음
→ 도메인이 카카오 콘솔에 등록되었는지 확인하세요

### 주소 검색이 안 됨
→ `libraries=services` 파라미터가 포함되었는지 확인하세요

## 다음 단계

자세한 설정과 고급 기능은 [KAKAO_MAP_SETUP.md](./KAKAO_MAP_SETUP.md)를 참고하세요.
