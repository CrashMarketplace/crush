# 카카오 지도 API 설정 가이드

## 개요

BILIDA에서 카카오 지도 API를 사용하여 다음 기능을 제공합니다:
- 상품 등록 시 거래 희망 장소 선택
- 예약 시 만날 장소 지도에서 선택
- 주소 검색 및 자동완성
- 지도 클릭으로 정확한 위치 지정

## 1. 카카오 개발자 계정 생성

1. **카카오 개발자 사이트 접속**
   - https://developers.kakao.com 접속
   - 카카오 계정으로 로그인

2. **애플리케이션 추가**
   - 내 애플리케이션 → 애플리케이션 추가하기
   - 앱 이름: `BILIDA` (또는 원하는 이름)
   - 사업자명: 개인 또는 회사명 입력

## 2. JavaScript 키 발급

1. **앱 설정 → 일반**
   - 앱 키 섹션에서 `JavaScript 키` 확인
   - 이 키를 복사해둡니다

2. **플랫폼 설정**
   - 앱 설정 → 플랫폼 → Web 플랫폼 등록
   - 사이트 도메인 등록:
     ```
     http://localhost:5173
     https://bilida.site
     https://www.bilida.site
     https://your-vercel-domain.vercel.app
     ```

## 3. 환경 변수 설정

### 개발 환경 (client/.env)

```env
VITE_API_BASE=http://localhost:4000
VITE_KAKAO_MAP_API_KEY=YOUR_JAVASCRIPT_KEY_HERE
```

### 프로덕션 환경 (Vercel)

Vercel 대시보드에서 환경 변수 추가:
- Key: `VITE_KAKAO_MAP_API_KEY`
- Value: 발급받은 JavaScript 키

## 4. HTML 파일 수정

`client/index.html` 파일에서 API 키 교체:

```html
<!-- 현재 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_APP_KEY&libraries=services,clusterer,drawing"></script>

<!-- 수정 후 -->
<script type="text/javascript" src="//dapi.kakao.com/v2/maps/sdk.js?appkey=실제_발급받은_키&libraries=services,clusterer,drawing"></script>
```

또는 환경 변수를 사용하려면 동적으로 로드:

`client/src/utils/loadKakaoMap.ts` 생성:

```typescript
export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    
    if (!apiKey) {
      reject(new Error('카카오 지도 API 키가 설정되지 않았습니다.'));
      return;
    }

    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    
    script.onerror = () => {
      reject(new Error('카카오 지도 API 로드 실패'));
    };
    
    document.head.appendChild(script);
  });
}
```

## 5. 사용 가능한 컴포넌트

### KakaoMap

기본 지도 표시 컴포넌트

```tsx
import KakaoMap from "../components/KakaoMap";

<KakaoMap
  address="서울특별시 강남구 테헤란로 123"
  height="400px"
  level={3}
  marker={true}
  draggable={true}
  onLocationSelect={(lat, lng, address) => {
    console.log("선택된 위치:", lat, lng, address);
  }}
/>
```

**Props:**
- `address?: string` - 표시할 주소
- `latitude?: number` - 위도
- `longitude?: number` - 경도
- `width?: string` - 지도 너비 (기본: "100%")
- `height?: string` - 지도 높이 (기본: "400px")
- `level?: number` - 확대 레벨 (1-14, 기본: 3)
- `marker?: boolean` - 마커 표시 여부 (기본: true)
- `draggable?: boolean` - 드래그 가능 여부 (기본: false)
- `onLocationSelect?: (lat, lng, address) => void` - 위치 선택 콜백

### AddressSearch

주소 검색 컴포넌트

```tsx
import AddressSearch from "../components/AddressSearch";

<AddressSearch
  onSelect={(address, lat, lng) => {
    console.log("선택된 주소:", address, lat, lng);
  }}
/>
```

**Props:**
- `onSelect: (address, lat, lng) => void` - 주소 선택 콜백

### LocationPicker

위치 선택 통합 컴포넌트 (검색 + 지도)

```tsx
import LocationPicker from "../components/LocationPicker";

<LocationPicker
  value={location}
  onChange={(location, lat, lng) => {
    setLocation(location);
    setLatitude(lat);
    setLongitude(lng);
  }}
  label="거래 희망 장소"
  required={true}
/>
```

**Props:**
- `value: string` - 현재 선택된 위치
- `onChange: (location, lat?, lng?) => void` - 위치 변경 콜백
- `label?: string` - 라벨 텍스트 (기본: "거래 희망 장소")
- `required?: boolean` - 필수 여부 (기본: false)

### ReservationModal

예약 모달 (지도 통합)

```tsx
import ReservationModal from "../components/ReservationModal";

<ReservationModal
  productTitle="아이폰 15 Pro"
  onSubmit={(data) => {
    console.log("예약 데이터:", data);
    // data.meetingLocation, data.latitude, data.longitude 등
  }}
  onClose={() => setShowModal(false)}
  loading={false}
/>
```

## 6. 사용 예시

### 상품 등록 페이지에서 위치 선택

```tsx
import { useState } from "react";
import LocationPicker from "../components/LocationPicker";

export default function ProductNew() {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      title: "상품명",
      price: 10000,
      location: location,
      latitude: latitude,
      longitude: longitude,
      // ... 기타 필드
    };

    // API 호출
  };

  return (
    <form onSubmit={handleSubmit}>
      <LocationPicker
        value={location}
        onChange={(loc, lat, lng) => {
          setLocation(loc);
          setLatitude(lat);
          setLongitude(lng);
        }}
        required={true}
      />
      {/* 기타 입력 필드 */}
    </form>
  );
}
```

### 상품 상세 페이지에서 위치 표시

```tsx
import KakaoMap from "../components/KakaoMap";

export default function ListingDetail() {
  const product = {
    location: "서울특별시 강남구 테헤란로 123",
    latitude: 37.5665,
    longitude: 126.978,
  };

  return (
    <div>
      <h2>거래 희망 장소</h2>
      <KakaoMap
        latitude={product.latitude}
        longitude={product.longitude}
        height="300px"
        level={3}
        marker={true}
        draggable={false}
      />
    </div>
  );
}
```

## 7. 데이터베이스 스키마 업데이트

위치 정보를 저장하기 위해 Product 모델에 필드 추가:

```typescript
// server/src/models/Product.ts
const ProductSchema = new Schema({
  // ... 기존 필드
  location: { type: String, default: "미정", index: true },
  latitude: { type: Number }, // 위도
  longitude: { type: Number }, // 경도
});
```

Reservation 모델에도 추가:

```typescript
// server/src/models/Reservation.ts
const ReservationSchema = new Schema({
  // ... 기존 필드
  meetingLocation: { type: String, default: "" },
  meetingLatitude: { type: Number },
  meetingLongitude: { type: Number },
});
```

## 8. API 엔드포인트 수정

상품 등록/수정 시 위치 정보 저장:

```typescript
// server/src/routes/products.ts
router.post("/", requireAuth, async (req, res) => {
  const { title, price, location, latitude, longitude, ... } = req.body;
  
  const product = new Product({
    seller: req.user._id,
    title,
    price,
    location,
    latitude,
    longitude,
    // ...
  });
  
  await product.save();
  res.json({ ok: true, product });
});
```

## 9. 주의사항

### API 사용량 제한
- 무료 플랜: 일 300,000건
- 초과 시 유료 전환 필요

### 보안
- API 키는 환경 변수로 관리
- `.env` 파일은 `.gitignore`에 추가
- 프로덕션 환경에서는 도메인 제한 설정

### 성능
- 지도 컴포넌트는 필요할 때만 렌더링
- 검색 결과는 상위 5개로 제한
- 디바운싱으로 과도한 API 호출 방지

## 10. 문제 해결

### "카카오 지도 API를 불러올 수 없습니다"
- API 키가 올바르게 설정되었는지 확인
- 도메인이 카카오 개발자 콘솔에 등록되었는지 확인
- 브라우저 콘솔에서 스크립트 로드 오류 확인

### 주소 검색이 안 됨
- `libraries=services` 파라미터가 포함되었는지 확인
- 네트워크 연결 상태 확인

### 지도가 표시되지 않음
- 컨테이너 div에 명시적인 width/height 설정 확인
- 카카오 맵 SDK가 완전히 로드된 후 지도 생성 확인

## 11. 추가 기능 아이디어

- 📍 내 위치 자동 감지 (Geolocation API)
- 🗺️ 여러 상품 위치를 지도에 마커로 표시
- 📏 거리 계산 (두 지점 간 거리)
- 🚗 길찾기 연동 (카카오맵 앱 연동)
- 🏢 주변 편의시설 표시

## 참고 자료

- [카카오 지도 API 공식 문서](https://apis.map.kakao.com/web/guide/)
- [카카오 개발자 센터](https://developers.kakao.com)
- [JavaScript API 가이드](https://apis.map.kakao.com/web/documentation/)
