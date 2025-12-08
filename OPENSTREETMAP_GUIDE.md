# OpenStreetMap 지도 가이드

## 개요

BILIDA는 **Leaflet + OpenStreetMap**을 사용하여 무료로 지도 기능을 제공합니다.

## 장점

✅ **완전 무료** - API 키 불필요
✅ **도메인 제한 없음** - 어디서든 사용 가능
✅ **사용량 제한 없음** - 무제한 사용
✅ **오픈소스** - 커뮤니티 기반
✅ **설정 간단** - npm install만 하면 끝

## 설치된 패키지

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

## 사용 가능한 컴포넌트

### 1. Map 컴포넌트

기본 지도 표시

```tsx
import Map from "../components/Map";

<Map
  latitude={37.5665}
  longitude={126.978}
  address="서울특별시 중구"
  height="400px"
  zoom={13}
  draggable={true}
/>
```

**Props:**
- `latitude?: number` - 위도 (기본: 37.5665 - 서울)
- `longitude?: number` - 경도 (기본: 126.978 - 서울)
- `address?: string` - 주소 (마커 팝업에 표시)
- `height?: string` - 지도 높이 (기본: "400px")
- `zoom?: number` - 확대 레벨 (기본: 13)
- `draggable?: boolean` - 드래그 가능 여부 (기본: true)

### 2. LocationInput 컴포넌트

위치 입력 및 자동완성

```tsx
import LocationInput from "../components/LocationInput";

<LocationInput
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
- `value: string` - 현재 입력된 위치
- `onChange: (location, lat?, lng?) => void` - 위치 변경 콜백
- `label?: string` - 라벨 텍스트
- `required?: boolean` - 필수 여부

**지원 도시:**
- 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종
- 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주

## 사용 예시

### 상품 등록 페이지

```tsx
import { useState } from "react";
import LocationInput from "../components/LocationInput";
import Map from "../components/Map";

export default function ProductNew() {
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();

  return (
    <form>
      <LocationInput
        value={location}
        onChange={(loc, lat, lng) => {
          setLocation(loc);
          setLatitude(lat);
          setLongitude(lng);
        }}
        required={true}
      />

      {latitude && longitude && (
        <Map
          latitude={latitude}
          longitude={longitude}
          address={location}
          height="300px"
        />
      )}
    </form>
  );
}
```

### 상품 상세 페이지

```tsx
import Map from "../components/Map";

export default function ProductDetail() {
  const product = {
    location: "서울",
    latitude: 37.5665,
    longitude: 126.978,
  };

  return (
    <div>
      <h2>거래 희망 장소</h2>
      <Map
        latitude={product.latitude}
        longitude={product.longitude}
        address={product.location}
        height="300px"
        draggable={false}
      />
    </div>
  );
}
```

## 데이터베이스 스키마

위치 정보를 저장하기 위한 필드:

```typescript
// Product 모델
{
  location: String,      // "서울", "강남구" 등
  latitude: Number,      // 37.5665
  longitude: Number,     // 126.978
}
```

## CSS 스타일링

Leaflet CSS는 자동으로 import됩니다:

```tsx
import "leaflet/dist/leaflet.css";
```

추가 스타일이 필요한 경우:

```css
.leaflet-container {
  border-radius: 0.5rem;
}

.leaflet-popup-content {
  font-size: 14px;
}
```

## 고급 기능

### 여러 마커 표시

```tsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const products = [
  { id: 1, lat: 37.5665, lng: 126.978, title: "상품 1" },
  { id: 2, lat: 37.5700, lng: 126.980, title: "상품 2" },
];

<MapContainer center={[37.5665, 126.978]} zoom={13}>
  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  {products.map((product) => (
    <Marker key={product.id} position={[product.lat, product.lng]}>
      <Popup>{product.title}</Popup>
    </Marker>
  ))}
</MapContainer>
```

### 클릭 이벤트

```tsx
import { useMapEvents } from "react-leaflet";

function LocationMarker() {
  const [position, setPosition] = useState(null);
  
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      console.log("클릭한 위치:", e.latlng);
    },
  });

  return position ? <Marker position={position} /> : null;
}
```

## 문제 해결

### 마커 아이콘이 안 보임

이미 해결되어 있습니다. `Map.tsx`에서 CDN 아이콘을 사용하도록 설정했습니다.

### 지도가 회색으로만 표시됨

컨테이너에 명시적인 높이를 설정하세요:

```tsx
<div style={{ height: "400px" }}>
  <Map ... />
</div>
```

### 빌드 오류

Leaflet CSS가 import되었는지 확인하세요:

```tsx
import "leaflet/dist/leaflet.css";
```

## 참고 자료

- [Leaflet 공식 문서](https://leafletjs.com/)
- [React Leaflet 문서](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)

## 비교: 카카오 지도 vs OpenStreetMap

| 항목 | 카카오 지도 | OpenStreetMap |
|------|------------|---------------|
| 비용 | 무료 (제한 있음) | 완전 무료 |
| API 키 | 필요 | 불필요 |
| 도메인 등록 | 필요 | 불필요 |
| 사용량 제한 | 일 300,000건 | 무제한 |
| 한국 지도 | 매우 상세 | 기본적 |
| 주소 검색 | 지원 | 직접 구현 필요 |
| 설정 난이도 | 중간 | 쉬움 |

## 결론

OpenStreetMap은 간단한 위치 표시에 완벽합니다. API 키나 도메인 등록 없이 바로 사용할 수 있어 개발과 배포가 매우 간편합니다.
