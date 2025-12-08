import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 마커 아이콘 수정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ClickableMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
}

function LocationMarker({ 
  position, 
  onPositionChange 
}: { 
  position: [number, number]; 
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker position={position}>
      <Popup>
        <div className="text-sm">
          <strong>선택한 위치</strong>
          <br />
          위도: {position[0].toFixed(6)}
          <br />
          경도: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
}

export default function ClickableMap({
  latitude,
  longitude,
  onLocationChange,
  height = "400px",
  zoom = 15,
}: ClickableMapProps) {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);

  const handlePositionChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
  };

  return (
    <div className="space-y-2">
      <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border-2 border-blue-300">
        <MapContainer
          center={position}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onPositionChange={handlePositionChange} />
        </MapContainer>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
        <span className="text-lg">📍</span>
        <div>
          <div className="font-semibold">지도를 클릭하여 정확한 거래 장소를 지정하세요</div>
          <div className="mt-1">
            현재 위치: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        </div>
      </div>
    </div>
  );
}
