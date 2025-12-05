// server/src/utils/authToken.ts
import jwt, { type JwtPayload } from "jsonwebtoken";

import type { Request as ExRequest, Response as ExResponse } from "express";
import "cookie-parser";
import type { StringValue } from "ms";


const secret = process.env.JWT_SECRET || "dev-secret";
const cookieName = process.env.JWT_COOKIE || "krush_token";

export function signUser(payload: {
  id: string;
  userId: string;
  email: string;
}) {
  const raw = process.env.JWT_EXPIRES ?? "7d";
  let expiresIn: number | StringValue;

  if (/^\d+$/.test(raw)) {
    expiresIn = Number(raw);
  } else {
    expiresIn = raw as StringValue;
  }

  return jwt.sign(payload as JwtPayload, secret, { expiresIn });
}

export function setAuthCookie(res: ExResponse, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: ExResponse) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(cookieName, "", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    expires: new Date(0),
    path: "/",
  });
}

function decodeUserFromToken(token?: string | null) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret) as {
      id: string;
      userId: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

export function readUserFromReq(req: ExRequest) {
  const token = req.cookies?.[cookieName] as string | undefined;
  return decodeUserFromToken(token);
}

function parseCookieHeader(raw?: string) {
  if (!raw) return {};
  return raw.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.split("=");
    if (!key) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
}

export function readUserFromCookieHeader(rawCookie?: string) {
  const cookies = parseCookieHeader(rawCookie);
  const token = cookies[cookieName];
  return decodeUserFromToken(token);
}
