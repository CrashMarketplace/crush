import { useState } from "react";
import KakaoMap from "./KakaoMap";
import AddressSearch from "./AddressSearch";

interface ReservationModalProps {
  productTitle: string;
  onSubmit: (data: {
    meetingLocation: string;
    meetingTime: string;
    notes: string;
    latitude?: number;
    longitude?: number;
  }) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ReservationModal({
  productTitle,
  onSubmit,
  onClose,
  loading = false,
}: ReservationModalProps) {
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number>();
  const [longitude, setLongitude] = useState<number>();
  const [showMap, setShowMap] = useState(false);

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setMeetingLocation(address);
    setLatitude(lat);
    setLongitude(lng);
    setShowMap(true);
  };

  const handleMapLocationSelect = (lat: number, lng: number, address: string) => {
    setMeetingLocation(address);
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      meetingLocation,
      meetingTime,
      notes,
      latitude,
      longitude,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">예약하기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">{productTitle}</p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 만날 장소 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              만날 장소 *
            </label>
            <AddressSearch onSelect={handleLocationSelect} />
            
            {meetingLocation && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-900">
                      선택된 장소
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {meetingLocation}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingLocation("");
                      setLatitude(undefined);
                      setLongitude(undefined);
                      setShowMap(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    변경
                  </button>
                </div>
              </div>
            )}

            {/* 지도 표시 */}
            {showMap && latitude && longitude && (
              <div className="mt-3">
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
          </div>

          {/* 만날 시간 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              만날 시간 (선택사항)
            </label>
            <input
              type="datetime-local"
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              메모 (선택사항)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="판매자에게 전달할 메시지를 입력하세요"
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!meetingLocation || loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
            >
              {loading ? "예약 중..." : "예약하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
