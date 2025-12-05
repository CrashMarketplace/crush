import { useState } from "react";
import KakaoMap from "../components/KakaoMap";
import AddressSearch from "../components/AddressSearch";
import LocationPicker from "../components/LocationPicker";
import { usePageTitle } from "../hooks/usePageTitle";

export default function MapExample() {
  usePageTitle("지도 예시", "카카오 지도 API 사용 예시");

  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedLat, setSelectedLat] = useState<number>();
  const [selectedLng, setSelectedLng] = useState<number>();

  const [pickerLocation, setPickerLocation] = useState("");
  const [pickerLat, setPickerLat] = useState<number>();
  const [pickerLng, setPickerLng] = useState<number>();

  return (
    <div className="container py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🗺️ 카카오 지도 API 예시</h1>

      {/* 예시 1: 주소 검색 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">1. 주소 검색</h2>
        <div className="bg-white rounded-lg border p-6">
          <AddressSearch
            onSelect={(address, lat, lng) => {
              setSelectedAddress(address);
              setSelectedLat(lat);
              setSelectedLng(lng);
            }}
          />

          {selectedAddress && (
            <div className="mt-4">
              <div className="text-sm text-gray-600 mb-2">선택된 위치:</div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedAddress}</div>
                <div className="text-sm text-gray-500 mt-1">
                  위도: {selectedLat?.toFixed(6)}, 경도: {selectedLng?.toFixed(6)}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 예시 2: 지도 표시 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">2. 지도 표시</h2>
        <div className="bg-white rounded-lg border p-6">
          {selectedLat && selectedLng ? (
            <KakaoMap
              latitude={selectedLat}
              longitude={selectedLng}
              height="400px"
              level={3}
              marker={true}
              draggable={true}
              onLocationSelect={(lat, lng, address) => {
                setSelectedLat(lat);
                setSelectedLng(lng);
                setSelectedAddress(address);
              }}
            />
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <p className="mb-2">🗺️</p>
                <p>위에서 주소를 검색하면 지도가 표시됩니다</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 예시 3: 통합 위치 선택기 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">3. 통합 위치 선택기</h2>
        <div className="bg-white rounded-lg border p-6">
          <LocationPicker
            value={pickerLocation}
            onChange={(location, lat, lng) => {
              setPickerLocation(location);
              setPickerLat(lat);
              setPickerLng(lng);
            }}
            label="거래 희망 장소"
            required={true}
          />

          {pickerLocation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-2">
                선택된 정보:
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <div>📍 주소: {pickerLocation}</div>
                {pickerLat && pickerLng && (
                  <div>
                    🌐 좌표: {pickerLat.toFixed(6)}, {pickerLng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 예시 4: 고정 위치 표시 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">4. 고정 위치 표시 (서울시청)</h2>
        <div className="bg-white rounded-lg border p-6">
          <KakaoMap
            latitude={37.5665}
            longitude={126.978}
            height="300px"
            level={3}
            marker={true}
            draggable={false}
          />
          <div className="mt-3 text-sm text-gray-600">
            드래그 불가능한 읽기 전용 지도 (상품 상세 페이지에서 사용)
          </div>
        </div>
      </section>

      {/* 사용 안내 */}
      <section className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
        <h3 className="font-bold text-yellow-900 mb-2">💡 사용 안내</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• 카카오 지도 API 키가 필요합니다</li>
          <li>• 설정 방법은 KAKAO_MAP_SETUP.md 문서를 참고하세요</li>
          <li>• 무료 플랜은 일 300,000건까지 사용 가능합니다</li>
          <li>• 지도를 클릭하면 정확한 위치를 선택할 수 있습니다</li>
        </ul>
      </section>
    </div>
  );
}
