/**
 * API 베이스 URL을 동적으로 생성합니다.
 * 환경 변수가 설정되어 있으면 그것을 사용하고,
 * 없으면 개발 환경에서만 localhost를 사용합니다.
 * 프로덕션 환경에서는 반드시 환경 변수가 필요합니다.
 */
export function getApiBaseUrl(): string {
  // VITE_API_URL을 우선적으로 사용 (Railway URL 등)
  if (import.meta.env.VITE_API_URL) {
    const url = import.meta.env.VITE_API_URL.trim();
    // URL이 /api로 끝나지 않으면 추가
    return url.endsWith('/api') ? url : url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  
  // 하위 호환성: VITE_API_BASE도 지원
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.trim();
  }
  
  // 브라우저 환경에서 개발 환경인 경우에만 localhost 사용
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    
    // 개발 환경: localhost인 경우에만 포트 4000 사용
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:4000/api`;
    }
    
    // 프로덕션 환경에서는 환경 변수가 필수
    // 환경 변수가 없으면 명확한 경고 메시지
    console.error(
      '❌ VITE_API_URL 환경 변수가 설정되지 않았습니다!\n' +
      'Netlify 환경 변수에 VITE_API_URL을 추가해주세요.\n' +
      '예: VITE_API_URL=https://your-railway-url.up.railway.app\n' +
      '현재는 상대 경로를 사용하므로 API 요청이 실패할 수 있습니다.'
    );
    
    // 프로덕션에서 환경 변수가 없으면 상대 경로 반환 (하지만 이는 Netlify로 요청이 가므로 문제)
    // 경고를 표시했으므로 개발자가 환경 변수를 설정하도록 유도
    return '/api';
  }
  
  // 서버 사이드 렌더링 등에서는 기본값 반환
  console.warn('VITE_API_URL 환경 변수가 설정되지 않았습니다. 기본값 /api를 사용합니다.');
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

