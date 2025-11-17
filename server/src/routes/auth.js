"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/routes/auth.ts
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const zod_1 = require("zod");
const nodemailer_1 = __importDefault(require("nodemailer"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const EmailCode_1 = __importDefault(require("../models/EmailCode"));
const User_1 = __importDefault(require("../models/User"));
const authToken_1 = require("../utils/authToken");
/* ---------------------- utils ---------------------- */
function requireEnv(name) {
    const v = process.env[name];
    if (!v)
        throw new Error(`Missing env ${name}`);
    return v;
}
const mask = (s) => (s ? s.slice(0, 2) + "***" : "(missing)");
const toPublicUser = (user) => ({
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
const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (e) {
        console.error("SMTP verify failed:", e?.message || e);
    }
})();
/* ---------------------- schema --------------------- */
const sendSchema = zod_1.z.object({ email: zod_1.z.string().email() });
const verifySchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    code: zod_1.z.string().min(4).max(8),
});
const signupSchema = zod_1.z.object({
    userId: zod_1.z.string().min(3),
    password: zod_1.z.string().min(4),
    email: zod_1.z.string().email(),
});
const loginSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
    password: zod_1.z.string().min(1),
});
const profileInfoSchema = zod_1.z
    .object({
    displayName: zod_1.z
        .string()
        .trim()
        .min(2, "닉네임은 2글자 이상 필요해요.")
        .max(20, "닉네임은 20자를 넘길 수 없어요.")
        .optional(),
    location: zod_1.z
        .string()
        .trim()
        .max(40, "지역명은 40자 이내로 입력해주세요.")
        .optional(),
    bio: zod_1.z
        .string()
        .trim()
        .max(200, "소개는 200자 이내로 입력해주세요.")
        .optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "수정할 내용을 입력해주세요.",
});
const avatarUpdateSchema = zod_1.z.object({
    avatarUrl: zod_1.z
        .string()
        .url("올바른 이미지 주소를 입력해주세요.")
        .max(600, "URL 길이가 너무 깁니다."),
});
/* -------------------- router ----------------------- */
const router = (0, express_1.Router)();
const limiter = (0, express_rate_limit_1.default)({ windowMs: 60000, max: 10 });
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
        await EmailCode_1.default.findOneAndUpdate({ email }, { code, expiresAt, attempts: 0 }, { upsert: true, new: true });
        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM ?? requireEnv("SMTP_USER"),
            to: email,
            subject: "KRUSH 이메일 인증코드",
            text: `인증코드: ${code} (10분 이내 유효)`,
            html: `<p>인증코드: <b style="font-size:18px;">${code}</b></p><p>10분 이내에 입력해 주세요.</p>`,
        });
        return res.json({ ok: true, messageId: info.messageId });
    }
    catch (e) {
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
        const doc = await EmailCode_1.default.findOne({ email });
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
        await EmailCode_1.default.deleteOne({ email });
        return res.json({ ok: true, verified: true });
    }
    catch (e) {
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
        const exists = await User_1.default.findOne({ $or: [{ userId }, { email }] });
        if (exists) {
            return res
                .status(409)
                .json({ ok: false, error: "이미 사용 중인 아이디/이메일" });
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        const user = await User_1.default.create({
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
    }
    catch (e) {
        console.error("signup error:", e);
        const msg = e?.message || "Failed to signup";
        return res.status(400).json({ ok: false, error: msg });
    }
});
/** 로그인 */
router.post("/login", limiter, async (req, res) => {
    try {
        const { userId, password } = loginSchema.parse(req.body);
        const user = await User_1.default.findOne({ userId });
        if (!user) {
            return res.status(401).json({
                ok: false,
                error: "아이디 또는 비밀번호가 올바르지 않습니다.",
            });
        }
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok) {
            return res.status(401).json({
                ok: false,
                error: "아이디 또는 비밀번호가 올바르지 않습니다.",
            });
        }
        const token = (0, authToken_1.signUser)({
            id: String(user._id),
            userId: user.userId,
            email: user.email,
        });
        (0, authToken_1.setAuthCookie)(res, token);
        return res.json({
            ok: true,
            user: toPublicUser(user),
        });
    }
    catch (e) {
        console.error("login error:", e);
        return res
            .status(500)
            .json({ ok: false, error: e?.message || "login failed" });
    }
});
/** 내 정보(me) */
router.get("/me", async (req, res) => {
    const session = (0, authToken_1.readUserFromReq)(req);
    if (!session)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    const user = await User_1.default.findById(session.id);
    if (!user) {
        (0, authToken_1.clearAuthCookie)(res);
        return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    return res.json({ ok: true, user: toPublicUser(user) });
});
router.patch("/profile/info", async (req, res) => {
    const session = (0, authToken_1.readUserFromReq)(req);
    if (!session)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
        const payload = profileInfoSchema.parse(req.body);
        const user = await User_1.default.findById(session.id);
        if (!user) {
            (0, authToken_1.clearAuthCookie)(res);
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
    }
    catch (e) {
        const msg = e?.issues?.[0]?.message ||
            e?.message ||
            "프로필 정보를 수정할 수 없습니다.";
        return res.status(400).json({ ok: false, error: msg });
    }
});
router.patch("/profile/avatar", async (req, res) => {
    const session = (0, authToken_1.readUserFromReq)(req);
    if (!session)
        return res.status(401).json({ ok: false, error: "unauthorized" });
    try {
        const { avatarUrl } = avatarUpdateSchema.parse(req.body);
        const user = await User_1.default.findById(session.id);
        if (!user) {
            (0, authToken_1.clearAuthCookie)(res);
            return res.status(401).json({ ok: false, error: "unauthorized" });
        }
        user.avatarUrl = avatarUrl;
        await user.save();
        return res.json({ ok: true, user: toPublicUser(user) });
    }
    catch (e) {
        const msg = e?.issues?.[0]?.message ||
            e?.message ||
            "프로필 이미지를 수정할 수 없습니다.";
        return res.status(400).json({ ok: false, error: msg });
    }
});
/** 로그아웃 */
router.post("/logout", (_req, res) => {
    (0, authToken_1.clearAuthCookie)(res);
    return res.json({ ok: true });
});
exports.default = router;
