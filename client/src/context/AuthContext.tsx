import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { buildApiUrl } from "../utils/apiConfig";

type User =
  | {
      id: string;
      userId: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      location?: string;
      bio?: string;
    }
  | null;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const fullUrl = buildApiUrl(path);
  const res = await fetch(fullUrl, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data as any)?.ok === false) {
    throw new Error((data as any)?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

type AuthContextValue = {
  user: User;
  loading: boolean; // 초기 부팅/복구 로딩
  authBusy: boolean; // 로그인/로그아웃 진행중 플래그 (선택)
  login: (userId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);

  // 앱 처음 시작할 때 세션 복구 (/auth/me)
  useEffect(() => {
    (async () => {
      try {
        const me = await api<{ ok: true; user: User }>("/auth/me");
        setUser(me.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    const me = await api<{ ok: true; user: User }>("/auth/me");
    setUser(me.user);
  };

  const login = async (userId: string, password: string) => {
    setAuthBusy(true);
    try {
      const res = await api<{ ok: true; user: NonNullable<User> }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ userId, password }),
        }
      );
      setUser(res.user); // ✅ 로그인 직후 컨텍스트 갱신
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      await api<{ ok: true }>("/auth/logout", { method: "POST" });
      setUser(null); // ✅ 로그아웃 반영
    } finally {
      setAuthBusy(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, authBusy, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}