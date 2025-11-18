import { API_BASE } from "../utils/apiConfig";

export type ApiError = { error?: string; message?: string };

const API = API_BASE;

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // path가 /api로 시작하지 않으면 /api를 추가
  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  // API_BASE는 Railway URL (예: https://crush-production.up.railway.app)
  // /api는 경로에 포함되므로 그대로 사용
  const fullUrl = API_BASE ? `${API_BASE}${apiPath}` : apiPath;
  const res = await fetch(fullUrl, { 
    ...options, 
    headers,
    credentials: "include" 
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const msg =
      (data as ApiError).error || (data as ApiError).message || res.statusText;
    throw new Error(msg);
  }
  return data as T;
}

async function post<T>(path: string, body: any): Promise<T> {
  // path가 /api로 시작하지 않으면 /api를 추가
  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  const fullUrl = API ? `${API}${apiPath}` : apiPath;
  const res = await fetch(fullUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false)
    throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

async function get<T>(path: string): Promise<T> {
  // path가 /api로 시작하지 않으면 /api를 추가
  const apiPath = path.startsWith('/api') ? path : `/api${path}`;
  const fullUrl = API ? `${API}${apiPath}` : apiPath;
  const res = await fetch(fullUrl, { credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.ok === false)
    throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export const AuthAPI = {
  login: (userId: string, password: string) =>
    post<{ ok: true; user: any }>("/auth/login", { userId, password }),
  me: () => get<{ ok: true; user: any }>("/auth/me"),
  logout: () => post<{ ok: true }>("/auth/logout", {}),
};
export { post, get };
