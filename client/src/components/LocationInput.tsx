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
  class: string;
  name?: string;
  address?: {
    amenity?: string;
    shop?: string;
    building?: string;
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    house_number?: string;
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
        // 더 넓은 범위로 검색 (건물, 상가, POI 모두 포함)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `q=${encodeURIComponent(inputValue)}&` +
          `countrycodes=kr&` +
          `format=json&` +
          `limit=15&` + // 15개로 증가
          `addressdetails=1&` +
          `extratags=1&` +
          `namedetails=1&` +
          `dedupe=0`, // 중복 제거 비활성화로 더 많은 결과
          {
            headers: {
              'Accept-Language': 'ko-KR,ko;q=0.9',
              'User-Agent': 'BILIDA/1.0'
            }
          }
        );

        const results: SearchResult[] = await response.json();
        
        // 관련성 높은 순으로 정렬 (건물, 상가, POI 우선)
        const sortedResults = results.sort((a, b) => {
          const priorityA = getPriority(a);
          const priorityB = getPriority(b);
          return priorityB - priorityA;
        });

        setSearchResults(sortedResults.slice(0, 10));
      } catch (error) {
        console.error("장소 검색 실패:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms로 단축

    function getPriority(place: SearchResult): number {
      // 건물, 상가, POI에 높은 우선순위
      if (place.class === 'building') return 10;
      if (place.class === 'shop') return 9;
      if (place.class === 'amenity') return 8;
      if (place.class === 'railway' || place.type === 'station') return 7;
      if (place.class === 'tourism') return 6;
      if (place.class === 'office') return 5;
      return 1;
    }

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
    // 더 자세한 주소 생성
    let displayName = place.display_name.split(',')[0];
    
    if (place.address) {
      const parts = [];
      if (place.address.road) parts.push(place.address.road);
      if (place.address.suburb) parts.push(place.address.suburb);
      if (place.address.city) parts.push(place.address.city);
      
      if (parts.length > 0) {
        displayName = `${displayName} (${parts.slice(0, 2).join(', ')})`;
      }
    }
    
    setInputValue(displayName);
    setShowSuggestions(false);
    onChange(displayName, parseFloat(place.lat), parseFloat(place.lon));
  };

  // 장소 타입에 따른 아이콘
  const getPlaceIcon = (place: SearchResult) => {
    if (place.class === 'amenity') {
      if (place.type === 'cafe') return '☕';
      if (place.type === 'restaurant') return '🍽️';
      if (place.type === 'bank') return '🏦';
      if (place.type === 'hospital') return '🏥';
      if (place.type === 'school') return '🏫';
      if (place.type === 'library') return '📚';
      return '🏢';
    }
    if (place.class === 'railway' || place.type === 'station') return '🚇';
    if (place.class === 'shop') return '🛍️';
    if (place.class === 'building') return '🏢';
    if (place.class === 'highway') return '🛣️';
    return '📍';
  };

  // 더 자세한 주소 표시
  const getDetailedAddress = (place: SearchResult) => {
    const parts = [];
    
    if (place.address) {
      if (place.address.house_number) parts.push(place.address.house_number);
      if (place.address.road) parts.push(place.address.road);
      if (place.address.suburb) parts.push(place.address.suburb);
      if (place.address.city) parts.push(place.address.city);
    }
    
    return parts.length > 0 ? parts.join(' ') : place.display_name.split(',').slice(0, 3).join(', ');
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
          placeholder="예: 노마즈하우스, 스타벅스 강남점, 강남역 등"
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
                  📍 검색 결과 ({searchResults.length}개)
                </div>
                {searchResults.map((place) => (
                  <button
                    key={place.place_id}
                    type="button"
                    onClick={() => handleSelectPlace(place)}
                    className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors border-b last:border-b-0"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-0.5">{getPlaceIcon(place)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900">
                          {place.display_name.split(',')[0]}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {getDetailedAddress(place)}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                            {place.type}
                          </span>
                          <span className="text-xs text-gray-400">
                            {parseFloat(place.lat).toFixed(5)}, {parseFloat(place.lon).toFixed(5)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!isSearching && searchResults.length === 0 && inputValue.length >= 2 && citySuggestions.length === 0 && (
              <div className="px-4 py-4 text-sm text-gray-500 text-center space-y-2">
                <div>😕 검색 결과가 없습니다</div>
                <div className="text-xs">
                  💡 팁: "대구 중구", "서울 강남구" 같이 지역명을 함께 입력하거나<br/>
                  유명한 랜드마크 근처로 검색해보세요
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        💡 상가명, 카페, 지하철역, 건물명 등 구체적으로 검색하세요 (예: 대구 노마즈하우스)
      </div>
    </div>
  );
}
