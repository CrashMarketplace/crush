import { useState } from "react";
import KakaoMap from "./KakaoMap";
import AddressSearch from "./AddressSearch";

interface LocationPickerProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
  label?: string;
  required?: boolean;
}

export default function LocationPicker({
  value,
  onChange,
  label = "거래 희망 장소",
  required = false,
}: LocationPickerProps) {
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    onChange(address, lat, lng);
    setLatitude(lat);
    setLongitude(lng);
    setShowMap(true);
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    onChange(address, lat, lng);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleClear = () => {
    onChange("");
    setLatitude(undefined);
    setLongitude(undefined);
    setShowMap(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* 주소 검색 */}
      {!value && <AddressSearch onSelect={handleLocationSelect} />}

      {/* 선택된 위치 */}
      {value && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                선택된 장소
              </div>
              <div className="text-sm text-gray-600 mt-1">{value}</div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              변경
            </button>
          </div>
        </div>
      )}

      {/* 지도 표시 */}
      {showMap && latitude && longitude && (
        <div>
          <div className="text-sm text-gray-600 mb-2">
            지도를 클릭하여 정확한 위치를 선택할 수 있습니다
          </div>
          <KakaoMap
            latitude={latitude}
            longitude={longitude}
            height="300px"
            level={3}
            marker={true}
            draggable={true}
            onLocationSelect={handleMapLocationSelect}
          />
        </div>
      )}

      {/* 직접 입력 옵션 */}
      {!value && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              const manualInput = prompt("거래 희망 장소를 직접 입력하세요:");
              if (manualInput) {
                onChange(manualInput);
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            또는 직접 입력하기
          </button>
        </div>
      )}
    </div>
  );
}
