// server/src/routes/auth.ts
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

import EmailCode from "../models/Emailcode.js";
import User from "../models/User.js";

/* ---------------------- utils ---------------------- */
function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}
const mask = (s?: string) => (s ? s.slice(0, 2) + "***" : "(missing)");

/* ------------------- nodemailer -------------------- */
/**
 * Gmail 사용: 앱 비밀번호 필요(구글 계정 → 보안 → 2단계 인증 → 앱 비밀번호)
 * SMTP_HOST/PORT/SECURE는 service 사용 시 자동 설정되므로 생략 가능
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
    if (!doc)
      return res
        .status(400)
        .json({ ok: false, error: "코드를 다시 요청하세요." });

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
    if (exists)
      return res
        .status(409)
        .json({ ok: false, error: "이미 사용 중인 아이디/이메일" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      userId,
      passwordHash: hash,
      email,
      emailVerified: true, // 실제 서비스에선 verify 토큰으로 강제하는 것을 권장
    });

    return res.json({
      ok: true,
      user: { id: String(user._id), userId: user.userId, email: user.email },
    });
  } catch (e: any) {
    console.error("signup error:", e);
    const msg = e?.message || "Failed to signup";
    return res.status(400).json({ ok: false, error: msg });
  }
});

export default router;
