/**
 * API 기본 주소 가져오기
 */
export function getApiBaseUrl(): string {
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
  }

  console.error("❌ API BASE URL이 설정되지 않음");
  return "";
}

export const API_BASE = getApiBaseUrl();

/**
 * API URL 생성 (/api prefix 자동 추가)
 */
export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }

  return `${API_BASE}/api${path}`;
}

/**
 * SOCKET 서버 기본 주소
 */
export const SOCKET_BASE =
  import.meta.env.VITE_SOCKET_BASE?.trim() || API_BASE;
