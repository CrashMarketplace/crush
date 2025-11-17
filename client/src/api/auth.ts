import { API_BASE } from "../utils/apiConfig";

const BASE = API_BASE;

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  const data = await res.json();
  if (!res.ok || data?.ok === false)
    throw new Error(data?.error || "Request failed");
  return data as T;
}

export const AuthAPI = {
  sendCode: (email: string) =>
    req<{ ok: true; messageId: string }>("/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyCode: (email: string, code: string) =>
    req<{ ok: true; verified: boolean }>("/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  signup: (userId: string, password: string, email: string) =>
    req<{ ok: true; user: { id: string; userId: string; email: string } }>(
      "/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({ userId, password, email }),
      }
    ),
};
