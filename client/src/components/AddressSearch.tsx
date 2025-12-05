import { useState } from "react";

interface AddressSearchProps {
  onSelect: (address: string, lat: number, lng: number) => void;
}

interface SearchResult {
  address_name: string;
  place_name?: string;
  x: string; // longitude
  y: string; // latitude
}

export default function AddressSearch({ onSelect }: AddressSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!keyword.trim()) {
      setError("검색어를 입력해주세요.");
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      setError("카카오 지도 API를 불러올 수 없습니다.");
      return;
    }

    setSearching(true);
    setError("");
    setResults([]);

    const kakao = window.kakao;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(keyword, (data: any, status: any) => {
      setSearching(false);

      if (status === kakao.maps.services.Status.OK) {
        setResults(data.slice(0, 5)); // 상위 5개만
      } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        setError("검색 결과가 없습니다.");
      } else {
        setError("검색 중 오류가 발생했습니다.");
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelect = (result: SearchResult) => {
    const address = result.address_name;
    const lat = parseFloat(result.y);
    const lng = parseFloat(result.x);
    onSelect(address, lat, lng);
    setResults([]);
    setKeyword("");
  };

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="주소 또는 장소명을 입력하세요"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={searching}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {searching ? "검색중..." : "검색"}
        </button>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 검색 결과 */}
      {results.length > 0 && (
        <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(result)}
              className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-sm">
                {result.place_name || result.address_name}
              </div>
              {result.place_name && (
                <div className="text-xs text-gray-500 mt-1">
                  {result.address_name}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
