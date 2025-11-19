/**
 * API 기본 주소 가져오기
 * Netlify 환경 변수(VITE_API_URL)를 사용하고,
 * 없으면 개발 환경에서만 localhost를 사용
 */
export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE;

  if (viteApiUrl && viteApiUrl.trim() !== "") {
    const url = viteApiUrl.trim();
    const clean = url.endsWith("/") ? url.slice(0, -1) : url;
    console.log("✅ API BASE:", clean);
    return clean;
  }

  // 개발 환경
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
 * API URL 생성 (절대 /api 붙이지 않음!!)
 * 서버가 /api prefix를 사용하지 않으므로 그대로 path만 붙임
 * ex) buildApiUrl("/products") → https://xxx/products
 */
export function buildApiUrl(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return `${API_BASE}${path}`;
}
