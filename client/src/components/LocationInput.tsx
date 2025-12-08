import { useState, useEffect, useRef } from "react";

interface LocationInputProps {
  value: string;
  onChange: (location: string, lat?: number, lng?: number) => void;
  label?: string;
  required?: boolean;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
  };
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 도시 자동완성
  const citySuggestions = Object.keys(KOREA_CITIES).filter((city) =>
    city.includes(inputValue)
  );

  // Nominatim API로 실시간 장소 검색
  useEffect(() => {
    if (inputValue.length < 2) {
      setSearchResults([]);
      return;
    }

    // 디바운스: 500ms 후에 검색
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(inputValue)}&` +
          `countrycodes=kr&` +
          `format=json&` +
          `limit=5&` +
          `addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'ko-KR,ko;q=0.9',
            }
          }
        );
        const data: SearchResult[] = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error("장소 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue]);

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

  const handleSelectPlace = (place: SearchResult) => {
    const displayName = place.display_name.split(',').slice(0, 2).join(',');
    setInputValue(displayName);
    setShowSuggestions(false);
    onChange(displayName, parseFloat(place.lat), parseFloat(place.lon));
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
          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
          placeholder="예: 스타벅스 강남점, 강남역, 홍대입구역 등"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        />

        {showSuggestions && inputValue && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {/* 도시 빠른 선택 */}
            {citySuggestions.length > 0 && (
              <div className="border-b">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  🏙️ 주요 도시
                </div>
                {citySuggestions.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium">{city}</div>
                    <div className="text-xs text-gray-500">
                      {KOREA_CITIES[city].lat.toFixed(4)}, {KOREA_CITIES[city].lng.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 실시간 장소 검색 결과 */}
            {isSearching && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                🔍 검색 중...
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  📍 검색 결과
                </div>
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="font-medium text-sm">
                      {place.display_name.split(',')[0]}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {place.display_name.split(',').slice(1, 3).join(',')}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {place.type} • {parseFloat(place.lat).toFixed(4)}, {parseFloat(place.lon).toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isSearching && searchResults.length === 0 && inputValue.length >= 2 && citySuggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                검색 결과가 없습니다
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        💡 카페, 지하철역, 건물명 등을 검색할 수 있습니다
      </div>
    </div>
  );
}
