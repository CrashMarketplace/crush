// server/src/routes/auth.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

import EmailCode from "../models/EmailCode";
import User, { type UserDocument } from "../models/User";
import {
  signUser,
  setAuthCookie,
  clearAuthCookie,
  readUserFromReq,
} from "../utils/authToken";

/* ---------------------- utils ---------------------- */
function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
const mask = (s?: string) => (s ? s.slice(0, 2) + "***" : "(missing)");

const toPublicUser = (user: UserDocument) => ({
  id: String(user._id),
  userId: user.userId,
  email: user.email,
  displayName: user.displayName || user.userId,
  avatarUrl: user.avatarUrl || "",
  location: user.location || "",
  bio: user.bio || "",
});

/* ------------------- nodemailer -------------------- */
/**
 * Gmail 사용: 앱 비밀번호 필요(구글 계정 → 보안 → 2단계 인증 → 앱 비밀번호)
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: requireEnv("SMTP_USER"),
    pass: requireEnv("SMTP_PASS"),
  },
});

// 기동 시 1회 확인 로그
(async () => {
  console.log("[SMTP ENV]", {
    user: mask(process.env.SMTP_USER),
    pass: process.env.SMTP_PASS ? "(set)" : "(missing)",
  });
  try {
    await transporter.verify();
    console.log("SMTP ready");
  } catch (e: any) {
    console.error("SMTP verify failed:", e?.message || e);
  }
})();

/* ---------------------- schema --------------------- */
const sendSchema = z.object({ email: z.string().email() });
const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4).max(8),
});
const signupSchema = z.object({
  userId: z.string().min(3),
  password: z.string().min(4),
  email: z.string().email(),
});
const loginSchema = z.object({
  userId: z.string().min(1),
  password: z.string().min(1),
});
const profileInfoSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(2, "닉네임은 2글자 이상 필요해요.")
      .max(20, "닉네임은 20자를 넘길 수 없어요.")
      .optional(),
    location: z
      .string()
      .trim()
      .max(40, "지역명은 40자 이내로 입력해주세요.")
      .optional(),
    bio: z
      .string()
      .trim()
      .max(200, "소개는 200자 이내로 입력해주세요.")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "수정할 내용을 입력해주세요.",
  });
const avatarUpdateSchema = z.object({
  avatarUrl: z
    .string()
    .url("올바른 이미지 주소를 입력해주세요.")
    .max(600, "URL 길이가 너무 깁니다."),
});

/* -------------------- router ----------------------- */
const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 10 });

/**
 * POST /api/auth/send-code
 * body: { email }
 */
router.post("/send-code", limiter, async (req, res) => {
  try {
    const { email } = sendSchema.parse(req.body);

    // 6자리 코드 생성 & 만료 10분
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailCode.findOneAndUpdate(
      { email },
      { code, expiresAt, attempts: 0 },
      { upsert: true, new: true }
    );

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM ?? requireEnv("SMTP_USER"),
      to: email,
      subject: "KRUSH 이메일 인증코드",
      text: `인증코드: ${code} (10분 이내 유효)`,
      html: `<p>인증코드: <b style="font-size:18px;">${code}</b></p><p>10분 이내에 입력해 주세요.</p>`,
    });

    return res.json({ ok: true, messageId: info.messageId });
  } catch (e: any) {
    console.error("send-code error:", e);
    const msg = e?.message || "Failed to send email code";
    return res.status(500).json({ ok: false, error: msg });
  }
});

/**
 * POST /api/auth/verify-code
 * body: { email, code }
 */
router.post("/verify-code", limiter, async (req, res) => {
  try {
    const { email, code } = verifySchema.parse(req.body);

    const doc = await EmailCode.findOne({ email });
    if (!doc) {
      return res
        .status(400)
        .json({ ok: false, error: "코드를 다시 요청하세요." });
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      await doc.deleteOne();
      return res
        .status(400)
        .json({ ok: false, error: "코드가 만료되었습니다." });
    }

    if (doc.attempts >= 5) {
      return res.status(429).json({ ok: false, error: "시도 횟수 초과" });
    }

    if (doc.code !== code) {
      doc.attempts += 1;
      await doc.save();
      return res
        .status(400)
        .json({ ok: false, error: "인증코드가 일치하지 않습니다." });
    }

    // 성공 시 사용 완료 처리
    await EmailCode.deleteOne({ email });
    return res.json({ ok: true, verified: true });
  } catch (e: any) {
    console.error("verify-code error:", e);
    const msg = e?.message || "Failed to verify code";
    return res.status(400).json({ ok: false, error: msg });
  }
});

/**
 * POST /api/auth/signup
 * body: { userId, password, email }
 */
router.post("/signup", limiter, async (req, res) => {
  try {
    const { userId, password, email } = signupSchema.parse(req.body);

    const exists = await User.findOne({ $or: [{ userId }, { email }] });
    if (exists) {
      return res
        .status(409)
        .json({ ok: false, error: "이미 사용 중인 아이디/이메일" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId,
      passwordHash: hash,
      email,
      emailVerified: true, // 실제 서비스는 verify 후 true 권장
    displayName: userId,
    });

    return res.json({
      ok: true,
    user: toPublicUser(user),
    });
  } catch (e: any) {
    console.error("signup error:", e);
    const msg = e?.message || "Failed to signup";
    return res.status(400).json({ ok: false, error: msg });
  }
});

/** 로그인 */
router.post("/login", limiter, async (req, res) => {
  try {
    const { userId, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(401).json({
        ok: false,
        error: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({
        ok: false,
        error: "아이디 또는 비밀번호가 올바르지 않습니다.",
      });
    }

    const token = signUser({
      id: String(user._id),
      userId: user.userId,
      email: user.email,
    });

    setAuthCookie(res, token);
    return res.json({
      ok: true,
      user: toPublicUser(user),
    });
  } catch (e: any) {
    console.error("login error:", e);
    return res
      .status(500)
      .json({ ok: false, error: e?.message || "login failed" });
  }
});

/** 내 정보(me) */
router.get("/me", async (req, res) => {
  const session = readUserFromReq(req);
  if (!session)
    return res.status(401).json({ ok: false, error: "unauthorized" });

  const user = await User.findById(session.id);
  if (!user) {
    clearAuthCookie(res);
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  return res.json({ ok: true, user: toPublicUser(user) });
});

router.patch("/profile/info", async (req, res) => {
  const session = readUserFromReq(req);
  if (!session)
    return res.status(401).json({ ok: false, error: "unauthorized" });

  try {
    const payload = profileInfoSchema.parse(req.body);
    const user = await User.findById(session.id);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    if (payload.displayName !== undefined) {
      user.displayName = payload.displayName;
    }
    if (payload.location !== undefined) {
      user.location = payload.location;
    }
    if (payload.bio !== undefined) {
      user.bio = payload.bio;
    }

    await user.save();
    return res.json({ ok: true, user: toPublicUser(user) });
  } catch (e: any) {
    const msg =
      e?.issues?.[0]?.message ||
      e?.message ||
      "프로필 정보를 수정할 수 없습니다.";
    return res.status(400).json({ ok: false, error: msg });
  }
});

router.patch("/profile/avatar", async (req, res) => {
  const session = readUserFromReq(req);
  if (!session)
    return res.status(401).json({ ok: false, error: "unauthorized" });

  try {
    const { avatarUrl } = avatarUpdateSchema.parse(req.body);
    const user = await User.findById(session.id);
    if (!user) {
      clearAuthCookie(res);
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    user.avatarUrl = avatarUrl;

    await user.save();
    return res.json({ ok: true, user: toPublicUser(user) });
  } catch (e: any) {
    const msg =
      e?.issues?.[0]?.message ||
      e?.message ||
      "프로필 이미지를 수정할 수 없습니다.";
    return res.status(400).json({ ok: false, error: msg });
  }
});

/** 로그아웃 */
router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

export default router;
