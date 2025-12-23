/**
 * API 기본 주소 가져오기
 */
export function getApiBaseUrl(): string {
  // Vercel 배포 시: Settings > Environment Variables에서 VITE_API_URL 설정 필수
  const viteApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

  if (viteApiUrl && viteApiUrl.trim() !== "") {
    const url = viteApiUrl.trim();
    const clean = url.endsWith("/") ? url.slice(0, -1) : url;
    console.log("✅ API BASE:", clean);
    return clean;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4000";
    }
    
    // 프로덕션 환경에서 환경 변수가 없으면 Render URL 사용
    if (host.includes("vercel.app") || host.includes("bilidamarket.com")) {
      const renderUrl = "https://crush-h4ws.onrender.com";
      console.warn("⚠️ VITE_API_URL이 설정되지 않음. Render URL 사용:", renderUrl);
      return renderUrl;
    }
  }

  console.error("❌ API BASE URL이 설정되지 않음");
  return "";
}

export const API_BASE = getApiBaseUrl();

/**
 * 이미지 URL 보정
 * 1. DB에 'http://localhost:4000/...'으로 저장된 레거시 데이터를 현재 API_BASE로 교체
 * 2. 상대 경로인 경우 API_BASE 추가
 */
export function fixImageUrl(url?: string): string {
  if (!url) return "";

  // data URI나 blob은 그대로 반환
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;

  // 🔥 DB에 저장된 localhost 주소를 현재 API 주소로 변경 (배포 환경 호환)
  if (url.includes("localhost:4000") || url.includes("127.0.0.1:4000")) {
    return url
      .replace("http://localhost:4000", API_BASE)
      .replace("http://127.0.0.1:4000", API_BASE);
  }

  // 절대 경로(http)는 그대로, 상대 경로는 API_BASE 붙임
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

/**
 * API URL 생성 (/api prefix 자동 추가)
 */
export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  if (!API_BASE) {
    console.error("❌ API_BASE가 설정되지 않음. path:", path);
    // 비상용 Render URL 사용
    const fallback = "https://crush-h4ws.onrender.com";
    console.warn("⚠️ Fallback URL 사용:", fallback);
    return `${fallback}/api${path}`;
  }

  const url = `${API_BASE}/api${path}`;
  console.log("🔗 API URL:", url);
  return url;
}

/**
 * SOCKET 서버 기본 주소
 */
export const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_BASE?.trim() || API_BASE;
