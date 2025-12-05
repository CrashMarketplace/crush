// 카카오 지도 API 타입 정의

declare global {
  interface Window {
    kakao: any;
  }
}

export interface KakaoMapOptions {
  center: any;
  level?: number;
  draggable?: boolean;
  scrollwheel?: boolean;
  disableDoubleClick?: boolean;
  disableDoubleClickZoom?: boolean;
}

export interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

export interface KakaoMarkerOptions {
  position: any;
  map?: any;
  image?: any;
  title?: string;
  draggable?: boolean;
  clickable?: boolean;
  zIndex?: number;
}

export interface KakaoSearchResult {
  address_name: string;
  place_name?: string;
  road_address_name?: string;
  x: string; // longitude
  y: string; // latitude
  place_url?: string;
  phone?: string;
  category_name?: string;
}

export interface KakaoGeocoderResult {
  address: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    mountain_yn: string;
    main_address_no: string;
    sub_address_no: string;
    zip_code: string;
  };
  road_address?: {
    address_name: string;
    region_1depth_name: string;
    region_2depth_name: string;
    region_3depth_name: string;
    road_name: string;
    underground_yn: string;
    main_building_no: string;
    sub_building_no: string;
    building_name: string;
    zone_no: string;
  };
}

export {};
