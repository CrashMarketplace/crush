"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUser = signUser;
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
exports.readUserFromReq = readUserFromReq;
exports.readUserFromCookieHeader = readUserFromCookieHeader;
// server/src/utils/authToken.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("cookie-parser");
const secret = process.env.JWT_SECRET || "dev-secret";
const cookieName = process.env.JWT_COOKIE || "krush_token";
function signUser(payload) {
    const raw = process.env.JWT_EXPIRES ?? "7d";
    let expiresIn;
    if (/^\d+$/.test(raw)) {
        expiresIn = Number(raw);
    }
    else {
        expiresIn = raw;
    }
    return jsonwebtoken_1.default.sign(payload, secret, { expiresIn });
}
function setAuthCookie(res, token) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(cookieName, token, {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
function clearAuthCookie(res) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookie(cookieName, "", {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        expires: new Date(0),
        path: "/",
    });
}
function decodeUserFromToken(token) {
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return decoded;
    }
    catch {
        return null;
    }
}
function readUserFromReq(req) {
    const token = req.cookies?.[cookieName];
    return decodeUserFromToken(token);
}
function parseCookieHeader(raw) {
    if (!raw)
        return {};
    return raw.split(";").reduce((acc, part) => {
        const [key, ...rest] = part.split("=");
        if (!key)
            return acc;
        acc[key.trim()] = decodeURIComponent(rest.join("=") || "");
        return acc;
    }, {});
}
function readUserFromCookieHeader(rawCookie) {
    const cookies = parseCookieHeader(rawCookie);
    const token = cookies[cookieName];
    return decodeUserFromToken(token);
}
