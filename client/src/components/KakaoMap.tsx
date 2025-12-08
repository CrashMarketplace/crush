import { useEffect, useRef, useState } from "react";

interface KakaoMapProps {
  address?: string;
  latitude?: number;
  longitude?: number;
  width?: string;
  height?: string;
  level?: number;
  marker?: boolean;
  draggable?: boolean;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    kakao: any;
  }
}

export default function KakaoMap({
  address,
  latitude,
  longitude,
  width = "100%",
  height = "400px",
  level = 3,
  marker = true,
  draggable = false,
  onLocationSelect,
}: KakaoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [currentMarker, setCurrentMarker] = useState<any>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!window.kakao || !window.kakao.maps) {
      setError("카카오 지도 API를 불러올 수 없습니다.");
      return;
    }

    const kakao = window.kakao;

    const mapOption = {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: level,
      draggable: draggable,
    };

    const newMap = new kakao.maps.Map(mapContainer.current, mapOption);
    setMap(newMap);

    if (onLocationSelect) {
      kakao.maps.event.addListener(newMap, "click", (mouseEvent: any) => {
        const latlng = mouseEvent.latLng;
        
        if (currentMarker) {
          currentMarker.setPosition(latlng);
        } else {
          const newMarker = new kakao.maps.Marker({
            position: latlng,
            map: newMap,
          });
          setCurrentMarker(newMarker);
        }

        const geocoder = new kakao.maps.services.Geocoder();
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            onLocationSelect(latlng.getLat(), latlng.getLng(), address);
          }
        });
      });
    }
  }, [level, draggable, onLocationSelect]);

  useEffect(() => {
    if (!map || !address) return;

    const kakao = window.kakao;
    const geocoder = new kakao.maps.services.Geocoder();

    geocoder.addressSearch(address, (result: any, status: any) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        
        map.setCenter(coords);

        if (marker) {
          if (currentMarker) {
            currentMarker.setMap(null);
          }
          const newMarker = new kakao.maps.Marker({
            map: map,
            position: coords,
          });
          setCurrentMarker(newMarker);
        }
      } else {
        setError("주소를 찾을 수 없습니다.");
      }
    });
  }, [map, address, marker]);

  useEffect(() => {
    if (!map || latitude === undefined || longitude === undefined) return;

    const kakao = window.kakao;
    const coords = new kakao.maps.LatLng(latitude, longitude);
    
    map.setCenter(coords);

    if (marker) {
      if (currentMarker) {
        currentMarker.setMap(null);
      }
      const newMarker = new kakao.maps.Marker({
        map: map,
        position: coords,
      });
      setCurrentMarker(newMarker);
    }
  }, [map, latitude, longitude, marker]);

  if (error) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
      >
        <div className="text-center text-gray-600">
          <p className="mb-2">🗺️</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      style={{ width, height }}
      className="rounded-lg border overflow-hidden"
    />
  );
}
