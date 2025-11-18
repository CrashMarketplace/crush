/**
 * API 베이스 URL을 동적으로 생성합니다.
 * 환경 변수가 설정되어 있으면 그것을 사용하고,
 * 없으면 개발 환경에서만 localhost를 사용합니다.
 * 프로덕션 환경에서는 반드시 환경 변수가 필요합니다.
 */
export function getApiBaseUrl(): string {
  // 디버깅: 모든 환경 변수 확인 (개발용)
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    console.log('🔍 디버그 - import.meta.env:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      VITE_API_BASE: import.meta.env.VITE_API_BASE,
      MODE: import.meta.env.MODE,
      PROD: import.meta.env.PROD,
      DEV: import.meta.env.DEV,
    });
  }
  
  // VITE_API_URL을 우선적으로 사용 (Railway URL 등)
  // ⚠️ 중요: Railway URL에는 /api를 붙이지 않습니다!
  // 예: https://crush-production.up.railway.app
  const viteApiUrl = import.meta.env.VITE_API_URL;
  
  if (viteApiUrl) {
    const url = String(viteApiUrl).trim();
    
    // 빈 문자열 체크
    if (url === '') {
      console.error(
        '❌ VITE_API_URL이 설정되어 있지만 값이 비어있습니다!\n' +
        'Netlify 환경 변수에서 VITE_API_URL의 값을 확인해주세요.\n' +
        '예: https://crush-production.up.railway.app'
      );
      // 빈 문자열이면 계속 진행하여 다른 옵션 확인
    } else {
      // URL 끝의 슬래시 제거 (일관성을 위해)
      const finalUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      // 환경 변수가 제대로 설정되었는지 확인용 로그 (프로덕션에서도 확인 가능)
      console.log('✅ VITE_API_URL 환경 변수가 설정되었습니다:', finalUrl);
      return finalUrl;
    }
  }
  
  // 하위 호환성: VITE_API_BASE도 지원
  if (import.meta.env.VITE_API_BASE) {
    const url = String(import.meta.env.VITE_API_BASE).trim();
    if (url !== '') {
      return url.endsWith('/') ? url.slice(0, -1) : url;
    }
  }
  
  // 브라우저 환경에서 개발 환경인 경우에만 localhost 사용
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    
    // 개발 환경: localhost인 경우에만 포트 4000 사용
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://${host}:4000`;
    }
    
    // 프로덕션 환경에서는 환경 변수가 필수
    // 환경 변수가 없으면 명확한 경고 메시지
    console.error(
      '❌ VITE_API_URL 환경 변수가 설정되지 않았습니다!\n' +
      '\n' +
      '🔧 해결 방법:\n' +
      '1. Netlify → Site settings → Environment variables\n' +
      '2. VITE_API_URL 변수를 클릭하여 값 확인\n' +
      '3. 값이 비어있거나 잘못되었다면 수정\n' +
      '   예: https://crush-production.up.railway.app\n' +
      '   ⚠️ 절대 /api를 붙이지 마세요!\n' +
      '4. 저장 후 "Clear cache and deploy site" 실행 (필수!)\n' +
      '5. 배포 완료 후 브라우저 하드 리프레시 (Ctrl+Shift+R / Cmd+Shift+R)\n' +
      '\n' +
      '💡 현재 상태:\n' +
      `- 현재 호스트: ${window.location.hostname}\n` +
      `- VITE_API_URL 값: ${viteApiUrl || '(없음)'}\n` +
      `- 빌드 모드: ${import.meta.env.MODE}\n` +
      '\n' +
      '⚠️ 현재는 상대 경로를 사용하므로 API 요청이 실패할 수 있습니다.'
    );
    
    // 프로덕션에서 환경 변수가 없으면 상대 경로 반환 (하지만 이는 Netlify로 요청이 가므로 문제)
    // 경고를 표시했으므로 개발자가 환경 변수를 설정하도록 유도
    return '';
  }
  
  // 서버 사이드 렌더링 등에서는 기본값 반환
  console.warn('VITE_API_URL 환경 변수가 설정되지 않았습니다. 기본값을 사용합니다.');
  return '';
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

