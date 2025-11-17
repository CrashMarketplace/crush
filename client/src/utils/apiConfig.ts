/**
 * API 베이스 URL을 동적으로 생성합니다.
 * 환경 변수가 설정되어 있으면 그것을 사용하고,
 * 없으면 현재 브라우저의 호스트를 기반으로 생성합니다.
 */
export function getApiBaseUrl(): string {
  // 환경 변수가 설정되어 있으면 사용
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // 브라우저 환경에서 현재 호스트를 사용
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    
    // 프로덕션 환경 (도메인으로 접근하는 경우)
    if (host !== 'localhost' && host !== '127.0.0.1') {
      // 같은 도메인에서 API 서빙 (서버가 클라이언트도 서빙하는 경우)
      return `${protocol}//${host}${port ? `:${port}` : ''}/api`;
    }
    
    // 개발 환경: 포트 4000에서 서버가 실행됨
    return `http://${host}:4000/api`;
  }
  
  // 기본값 (서버 사이드 렌더링 등)
  return '/api';
}

function getSocketBaseUrl(): string {
  const apiBase = getApiBaseUrl();
  const fallbackOrigin =
    typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "http://localhost:4000";
  try {
    const apiUrl = new URL(apiBase, fallbackOrigin);
    apiUrl.pathname = apiUrl.pathname.replace(/\/api\/?$/, "");
    if (apiUrl.pathname === "/") {
      apiUrl.pathname = "";
    }
    const normalized = apiUrl.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    return apiBase.replace(/\/api\/?$/, "");
  }
}

// 기본 export로 바로 사용 가능한 값 제공
export const API_BASE = getApiBaseUrl();
export const SOCKET_BASE = getSocketBaseUrl();

