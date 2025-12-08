import { useState } from "react";

interface LocationInputProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
  label?: string;
  required?: boolean;
}

// 한국 주요 도시 좌표
const KOREA_CITIES: Record<string, { lat: number; lng: number }> = {
  "서울": { lat: 37.5665, lng: 126.978 },
  "부산": { lat: 35.1796, lng: 129.0756 },
  "대구": { lat: 35.8714, lng: 128.6014 },
  "인천": { lat: 37.4563, lng: 126.7052 },
  "광주": { lat: 35.1595, lng: 126.8526 },
  "대전": { lat: 36.3504, lng: 127.3845 },
  "울산": { lat: 35.5384, lng: 129.3114 },
  "세종": { lat: 36.4800, lng: 127.2890 },
  "경기": { lat: 37.4138, lng: 127.5183 },
  "강원": { lat: 37.8228, lng: 128.1555 },
  "충북": { lat: 36.8000, lng: 127.7000 },
  "충남": { lat: 36.5184, lng: 126.8000 },
  "전북": { lat: 35.7175, lng: 127.1530 },
  "전남": { lat: 34.8679, lng: 126.9910 },
  "경북": { lat: 36.4919, lng: 128.8889 },
  "경남": { lat: 35.4606, lng: 128.2132 },
  "제주": { lat: 33.4890, lng: 126.4983 },
};

export default function LocationInput({
  value,
  onChange,
  label = "거래 희망 장소",
  required = false,
}: LocationInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const suggestions = Object.keys(KOREA_CITIES).filter((city) =>
    city.includes(inputValue)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    onChange(newValue);
  };

  const handleSelectCity = (city: string) => {
    const coords = KOREA_CITIES[city];
    setInputValue(city);
    setShowSuggestions(false);
    onChange(city, coords.lat, coords.lng);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="예: 서울, 강남구, 홍대 등"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />

        {showSuggestions && suggestions.length > 0 && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleSelectCity(city)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium">{city}</div>
                <div className="text-xs text-gray-500">
                  {KOREA_CITIES[city].lat.toFixed(4)}, {KOREA_CITIES[city].lng.toFixed(4)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        💡 도시명을 입력하면 자동으로 좌표가 설정됩니다
      </div>
    </div>
  );
}
