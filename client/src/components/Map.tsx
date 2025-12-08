import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 마커 아이콘 수정 (Leaflet 기본 아이콘 문제 해결)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  height?: string;
  zoom?: number;
  draggable?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
}

function MapUpdater({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom());
  }, [latitude, longitude, map]);
  
  return null;
}

export default function Map({
  latitude = 37.5665,
  longitude = 126.978,
  address,
  height = "400px",
  zoom = 13,
  draggable = true,
}: MapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div style={{ height, width: "100%" }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        dragging={draggable}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          {address && (
            <Popup>
              <div className="text-sm">
                <strong>위치</strong>
                <br />
                {address}
              </div>
            </Popup>
          )}
        </Marker>
        <MapUpdater latitude={latitude} longitude={longitude} />
      </MapContainer>
    </div>
  );
}
