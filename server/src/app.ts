// server/src/app.ts
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import fs from "fs";
import http from "http";

import express from "express";
import cors from "cors";
import type { CorsOptions } from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import multer from "multer";

import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import uploadRouter from "./routes/upload";
import chatsRouter from "./routes/chats";
import adminRouter from "./routes/admin";
import reservationsRouter from "./routes/reservations";
import notificationsRouter from "./routes/notifications";
import reviewsRouter from "./routes/reviews";
import paymentsRouter from "./routes/payments";
import fraudDetectionRouter from "./routes/fraudDetection";
import { initSocketServer } from "./realtime/socketManager";
import uploadsRouter from "./routes/uploads";

const app = express();

// ⭐ Railway / Proxy 환경에서 반드시 필요
app.set("trust proxy", 1);

// MODE
const isDevelopment = process.env.NODE_ENV !== "production";
const isRailway = Boolean(process.env.RAILWAY_PROJECT_ID);
const isProduction = !isDevelopment || isRailway;

// allowedOriginsList kept (not used directly now)
const allowedOriginsList = [
  "https://bilidamarket.com",
  "https://www.bilidamarket.com",
  "http://localhost:5173",
  "https://crush-git-main-0608s-projects.vercel.app",
  "https://crush-2et7g8ny6-0608s-projects.vercel.app",
  ...(process.env.ALLOWED_ORIGINS?.split(",").map(x => x.trim()) || []),
];

// CORS (permissive for Vercel previews)
const corsOptions: CorsOptions = { origin: true, credentials: true };
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// 🔒 보안 강화: Helmet with security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// Request log
app.use((req, _res, next) => {
  console.log(`📡 [${req.method}] ${req.path} | Origin=${req.headers.origin || "None"}`);
  next();
});

app.use(morgan("tiny"));

// Health
app.get("/health", (_req, res) => res.json({ ok: true, uptime: process.uptime() }));

// 🔒 보안 강화: Rate limit
app.use("/api", rateLimit({ 
  windowMs: 60000, // 1분
  max: 200, // 최대 200회
  standardHeaders: true, 
  legacyHeaders: false,
  message: { ok: false, error: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요." },
  skip: (req) => {
    // Health check는 rate limit 제외
    return req.path === "/health";
  }
}));

// ---- Uploads path & directory ensure ----
const uploadsPath = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(__dirname, "../uploads");

try {
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log("✅ Created uploads directory:", uploadsPath);
  } else {
    console.log("✅ Uploads directory exists:", uploadsPath);
  }
  const visibleFiles = fs.readdirSync(uploadsPath).filter(f => !f.startsWith("."));
  console.log(`🗂 uploads count: ${visibleFiles.length}`);
  if (visibleFiles.length === 0) {
    console.warn("⚠️ uploads 폴더 비어있음 (재배포 시 파일 소실). Volume / 외부 스토리지 사용 권장.");
  }
} catch (e) {
  console.warn("⚠️ uploads 폴더 점검 실패:", e);
}

// ---- Public base & URL normalization helpers ----
const PUBLIC_BASE = (process.env.PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
  "https://crush-production.up.railway.app");

function ensureUploadsPrefix(p: string) {
  let s = p.trim();
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/\/{2,}/g, "/");
  if (!/^\/uploads\//.test(s)) {
    s = s.replace(/^\/?uploads\/?/, "/uploads/");
    if (!/^\/uploads\//.test(s)) s = "/uploads" + s;
  }
  return s;
}

function normalizeImageUrl(raw?: string): string {
  if (!raw) return "";
  if (/^(data:|blob:)/.test(raw)) return raw;
  let url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `${PUBLIC_BASE}${ensureUploadsPrefix(url)}`;
  }
  return url
    .replace("http://localhost:4000", PUBLIC_BASE)
    .replace("http://127.0.0.1:4000", PUBLIC_BASE);
}

// ---- Uploads CORS middleware (DEFINE BEFORE USE) ----
const uploadsCorsMiddleware = (req: any, res: any, next: any) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  const origin = req.get("Origin");
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Vary", "Origin");
  next();
};

// Placeholder for missing files
const PLACEHOLDER_SVG =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#f1f5f9"/><path d="M3 9h18"/><path d="M8 14l3-3 5 5"/><circle cx="8.5" cy="8.5" r="1.5" fill="#e2e8f0"/><text x="50%" y="92%" font-size="2.5" fill="#94a3b8" dominant-baseline="middle" text-anchor="middle">NO IMAGE</text></svg>`
  );

// Missing file handler BEFORE static
app.use("/uploads/:file", (req, res, next) => {
  const abs = path.join(uploadsPath, req.params.file);
  if (!fs.existsSync(abs)) {
    console.warn("🟡 missing upload file:", req.params.file);
    res.setHeader("Content-Type", "image/svg+xml");
    return res.send(decodeURIComponent(PLACEHOLDER_SVG.split(",")[1]));
  }
  next();
});

// Single static mount (removed duplicate)
app.use("/uploads",
  (req, res, next) => {
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    next();
  },
  uploadsCorsMiddleware,
  express.static(uploadsPath)
);

// ---- Debug uploads listing ----
app.get("/api/debug/uploads", (_req, res) => {
  try {
    const list = fs.readdirSync(uploadsPath)
      .filter(f => !f.startsWith("."))
      .map(f => ({ file: f, url: normalizeImageUrl(`/uploads/${f}`) }));
    res.json({ ok: true, count: list.length, files: list });
  } catch (e: any) {
    res.json({ ok: false, error: e.message });
  }
});

// 디버그: ENV / 상태 확인
app.get("/api/debug/env", (_req, res) => {
  res.json({
    ok: true,
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: Boolean(process.env.MONGO_URI),
    PUBLIC_BASE,
    uploadsPath,
  });
});

// ---- API Routes ----
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/chats", chatsRouter);
app.use("/api/admin", adminRouter);
app.use("/api/reservations", reservationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/fraud-detection", fraudDetectionRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/upload", uploadsRouter);

// ---- Product response image normalization AFTER routes ----
app.use((req, res, next) => {
  if (!req.path.startsWith("/api/products")) return next();
  const orig = res.json.bind(res);
  res.json = (body: any) => {
    try {
      if (Array.isArray(body?.products)) {
        body.products = body.products.map((p: any) => {
          if (Array.isArray(p?.images)) {
            p.images = p.images.map((img: string) => normalizeImageUrl(img));
          }
          return p;
        });
      } else if (Array.isArray(body?.product?.images)) {
        body.product.images = body.product.images.map((img: string) => normalizeImageUrl(img));
      }
    } catch (e) {
      console.warn("⚠️ product image normalize failed:", e);
    }
    return orig(body);
  };
  next();
});

// Error handler
app.use((err: any, req: any, res: any, _next: any) => {
  console.error("Global error handler:", err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ ok: false, error: err.message });
  }
  return res.status(500).json({ ok: false, error: "internal_error" });
});

// Frontend serve
if (isProduction) {
  const clientPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientPath));
  app.use((req, res) => {
    if (req.path.startsWith("/api")) return res.status(404).json({ error: "API Not Found" });
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

// Socket
const server = http.createServer(app);
initSocketServer(server, true);

// Start
(async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ Missing MONGO_URI. Abort start.");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    const port = Number(process.env.PORT) || 4000;
    server.listen(port, "0.0.0.0", () => {
      console.log("=================================");
      console.log("🚀 Server started successfully!");
      console.log("Mode:", isProduction ? "Production" : "Development");
      console.log("PUBLIC_BASE:", PUBLIC_BASE);
      console.log("=================================");
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    // 실패 시 프로세스 종료 -> Railway 재시도
    process.exit(1);
  }
})();

export default app;
